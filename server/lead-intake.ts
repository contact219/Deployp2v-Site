/**
 * Website contact form → owner alert + CRM lead.
 *
 * Before this existed, POST /api/contact wrote a row and nothing else: no
 * notification of any kind, and the submission was never routed into the CRM.
 * Leads sat in a table nobody opened.
 *
 * Runs *after* the HTTP response has been sent, so a slow AI enrichment call or
 * a Telegram outage can never affect the visitor's submission.
 */

import { storage } from "./storage";
import { enrichLead, generateFollowUpTask } from "./ai-service";
import { sendTelegram } from "./notify";

/** Structurally the `contacts` row — kept local so this module doesn't couple
 *  to the schema exports. */
export type WebsiteContact = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  createdAt: Date;
};

const esc = (value: string): string =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function alertText(contact: WebsiteContact, leadId: number | null, score: number | null, urgency: string | null): string {
  const lines = [
    "🚨 <b>New lead — DeployP2V</b>",
    "",
    `<b>${esc(contact.name)}</b>${contact.company ? ` · ${esc(contact.company)}` : ""}`,
    `✉️ ${esc(contact.email)}`,
  ];
  if (contact.phone) lines.push(`📞 ${esc(contact.phone)}`);
  lines.push("");
  lines.push(`“${esc(contact.message.slice(0, 500))}”`);
  lines.push("");
  lines.push(`Source: website form · contact #${contact.id}`);
  if (leadId !== null) {
    const bits = [`CRM lead #${leadId}`];
    if (score !== null) bits.push(`score ${score}`);
    if (urgency) bits.push(`urgency ${urgency}`);
    lines.push(bits.join(" · "));
  } else {
    lines.push("⚠️ Existing lead for this email — logged against the original, no duplicate created.");
  }
  lines.push("");
  lines.push("Reply within 1 business day — that's the promise on the site.");
  return lines.join("\n");
}

/**
 * Alert the owner, create a CRM lead (unless one already exists for that email)
 * and queue an AI-generated follow-up task.
 */
export async function intakeWebsiteContact(contact: WebsiteContact): Promise<void> {
  let leadId: number | null = null;
  let score: number | null = null;
  let urgency: string | null = null;

  try {
    // Duplicate guard: the same person submitting twice used to create two
    // unrelated records and no follow-up either time.
    const existing = (await storage.getLeads()).find(
      (l) => l.email && l.email.toLowerCase() === contact.email.toLowerCase(),
    );

    if (existing) {
      leadId = existing.id;
      score = existing.score ?? null;
      urgency = existing.urgency ?? null;
      await storage.createActivity({
        leadId: existing.id,
        type: "email",
        subject: "Re-submitted website form",
        description: `${contact.name} submitted the contact form again (contact #${contact.id}).`,
      });
    } else {
      let enrichment: Record<string, unknown> = {};
      try {
        const ai = await enrichLead({
          name: contact.name,
          email: contact.email,
          company: contact.company || undefined,
          phone: contact.phone || undefined,
          message: contact.message,
          source: "website",
        });
        score = ai.score ?? null;
        urgency = ai.urgency ?? null;
        enrichment = {
          aiSummary: ai.aiSummary,
          industry: ai.industry,
          companySize: ai.companySize,
          estimatedBudget: ai.estimatedBudget,
          urgency: ai.urgency,
          painPoints: JSON.stringify(ai.painPoints ?? []),
          score: ai.score,
          tags: JSON.stringify(ai.tags ?? []),
        };
      } catch (err) {
        console.error("[lead-intake] AI enrichment failed (lead still created):", err);
      }

      const lead = await storage.createLead({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        source: "website",
        originalMessage: contact.message,
        status: "new",
        ...enrichment,
      } as Parameters<typeof storage.createLead>[0]);

      leadId = lead.id;
      score = (lead.score as number | null) ?? score;
      urgency = (lead.urgency as string | null) ?? urgency;

      await storage.createActivity({
        leadId: lead.id,
        type: "lead_created",
        subject: "Lead Created",
        description: `Website contact form submission (contact #${contact.id}).`,
      });

      try {
        const task = await generateFollowUpTask({
          leadName: lead.name,
          leadSummary: (lead.aiSummary as string | null) ?? contact.message,
          lastActivity: "Submitted the website contact form",
          daysSinceLastContact: 0,
          dealStage: "lead",
        });
        await storage.createTask({
          leadId: lead.id,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          dueDate: task.dueDate,
          aiGenerated: true,
          aiReason: task.aiReason,
        });
        await storage.createActivity({
          leadId: lead.id,
          type: "task_created",
          subject: "Follow-up task created",
          description: task.title,
        });
      } catch (err) {
        console.error("[lead-intake] follow-up task generation failed:", err);
      }
    }
  } catch (err) {
    console.error("[lead-intake] CRM routing failed:", err);
  }

  // Alert last so the message can carry the CRM reference, but wrapped so a
  // notification failure is never fatal.
  try {
    const alerted = await sendTelegram(alertText(contact, leadId, score, urgency));
    console.log(
      `[lead-intake] contact #${contact.id} -> lead ${leadId ?? "(existing)"} | alerted: ${alerted}`,
    );
  } catch (err) {
    console.error("[lead-intake] alert failed:", err);
  }
}
