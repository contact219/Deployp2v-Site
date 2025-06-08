import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

interface CalculatorInputs {
  industry: string;
  employees: string;
  monthlyRevenue: number;
  hoursOnManualTasks: number;
  averageHourlyWage: number;
  customerInquiriesPerDay: number;
  orderProcessingTime: number;
}

const industryMultipliers = {
  retail: { efficiency: 1.2, accuracy: 1.1, customer: 1.3 },
  restaurant: { efficiency: 1.4, accuracy: 1.2, customer: 1.1 },
  healthcare: { efficiency: 1.1, accuracy: 1.4, customer: 1.2 },
  realestate: { efficiency: 1.3, accuracy: 1.1, customer: 1.4 },
  professional: { efficiency: 1.2, accuracy: 1.3, customer: 1.2 },
  manufacturing: { efficiency: 1.5, accuracy: 1.3, customer: 1.1 },
  other: { efficiency: 1.2, accuracy: 1.2, customer: 1.2 }
};

export default function ROICalculator() {
  const [, setLocation] = useLocation();
  const [inputs, setInputs] = useState<CalculatorInputs>({
    industry: '',
    employees: '',
    monthlyRevenue: 0,
    hoursOnManualTasks: 0,
    averageHourlyWage: 15,
    customerInquiriesPerDay: 0,
    orderProcessingTime: 0
  });
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateROI = () => {
    if (!inputs.industry || !inputs.employees) return null;

    const multiplier = industryMultipliers[inputs.industry as keyof typeof industryMultipliers] || industryMultipliers.other;
    
    // Calculate monthly labor cost savings
    const monthlyManualTaskCost = inputs.hoursOnManualTasks * 4.33 * inputs.averageHourlyWage; // 4.33 weeks per month
    const laborSavings = monthlyManualTaskCost * 0.6 * multiplier.efficiency; // 60% reduction with industry multiplier
    
    // Calculate customer service efficiency gains
    const customerServiceSavings = (inputs.customerInquiriesPerDay * 30 * 0.1 * multiplier.customer); // $0.10 per inquiry saved
    
    // Calculate accuracy improvements (reduced errors)
    const errorReductionSavings = inputs.monthlyRevenue * 0.02 * multiplier.accuracy; // 2% of revenue typically lost to errors
    
    // Total monthly savings
    const totalMonthlySavings = laborSavings + customerServiceSavings + errorReductionSavings;
    
    // Implementation cost based on company size
    const employeeCount = parseInt(inputs.employees.split('-')[0]);
    let implementationCost = 2000; // Base cost
    if (employeeCount >= 10) implementationCost = 4000;
    if (employeeCount >= 25) implementationCost = 7000;
    if (employeeCount >= 50) implementationCost = 12000;
    
    // Monthly subscription (average of our plans)
    const monthlyCost = employeeCount < 10 ? 299 : employeeCount < 25 ? 599 : 999;
    
    // Calculate payback period and ROI
    const netMonthlySavings = totalMonthlySavings - monthlyCost;
    const paybackMonths = implementationCost / netMonthlySavings;
    const yearOneROI = ((netMonthlySavings * 12) / implementationCost) * 100;

    return {
      monthlySavings: totalMonthlySavings,
      monthlyCost,
      netMonthlySavings,
      yearOneSavings: netMonthlySavings * 12,
      implementationCost,
      paybackMonths,
      yearOneROI,
      breakdown: {
        laborSavings,
        customerServiceSavings,
        errorReductionSavings
      }
    };
  };

  const results = calculateROI();

  const handleCalculate = () => {
    if (inputs.industry && inputs.employees && inputs.monthlyRevenue > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-gray-300 hover:text-indigo-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2 text-2xl font-bold text-indigo-400">
            <Calculator className="w-8 h-8" />
            <span>ROI Calculator</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI ROI Calculator</h1>
          <p className="text-xl text-gray-300">
            Discover how much your business could save with AI automation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                <Select onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail/E-commerce</SelectItem>
                    <SelectItem value="restaurant">Restaurant/Food Service</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="professional">Professional Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employees" className="text-gray-300">Number of Employees</Label>
                <Select onValueChange={(value) => handleInputChange('employees', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 employees</SelectItem>
                    <SelectItem value="6-10">6-10 employees</SelectItem>
                    <SelectItem value="11-25">11-25 employees</SelectItem>
                    <SelectItem value="26-50">26-50 employees</SelectItem>
                    <SelectItem value="51-100">51-100 employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="revenue" className="text-gray-300">Monthly Revenue ($)</Label>
                <Input
                  type="number"
                  id="revenue"
                  value={inputs.monthlyRevenue || ''}
                  onChange={(e) => handleInputChange('monthlyRevenue', parseFloat(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="50000"
                />
              </div>

              <div>
                <Label htmlFor="manualHours" className="text-gray-300">Hours per week on manual tasks</Label>
                <Input
                  type="number"
                  id="manualHours"
                  value={inputs.hoursOnManualTasks || ''}
                  onChange={(e) => handleInputChange('hoursOnManualTasks', parseFloat(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="20"
                />
              </div>

              <div>
                <Label htmlFor="hourlyWage" className="text-gray-300">Average hourly wage ($)</Label>
                <Input
                  type="number"
                  id="hourlyWage"
                  value={inputs.averageHourlyWage || ''}
                  onChange={(e) => handleInputChange('averageHourlyWage', parseFloat(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="15"
                />
              </div>

              <div>
                <Label htmlFor="inquiries" className="text-gray-300">Customer inquiries per day</Label>
                <Input
                  type="number"
                  id="inquiries"
                  value={inputs.customerInquiriesPerDay || ''}
                  onChange={(e) => handleInputChange('customerInquiriesPerDay', parseFloat(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="50"
                />
              </div>

              <Button 
                onClick={handleCalculate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!inputs.industry || !inputs.employees || inputs.monthlyRevenue <= 0}
              >
                Calculate ROI
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && results && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your AI ROI Projection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">
                      {results.yearOneROI.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-300">Year One ROI</div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400">
                      {results.paybackMonths.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-300">Months to Payback</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Monthly Savings</span>
                    <span className="text-green-400 font-semibold">
                      ${results.monthlySavings.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Monthly AI Cost</span>
                    <span className="text-red-400 font-semibold">
                      -${results.monthlyCost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Net Monthly Benefit</span>
                    <span className="text-green-400 font-semibold text-lg">
                      ${results.netMonthlySavings.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Year One Net Savings</span>
                    <span className="text-green-400 font-bold text-xl">
                      ${results.yearOneSavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Savings Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Labor Efficiency</span>
                      <span className="text-green-400">${results.breakdown.laborSavings.toFixed(0)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Customer Service</span>
                      <span className="text-green-400">${results.breakdown.customerServiceSavings.toFixed(0)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Error Reduction</span>
                      <span className="text-green-400">${results.breakdown.errorReductionSavings.toFixed(0)}/mo</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setLocation('/')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Get Your Free Consultation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {showResults && (
          <div className="mt-12 text-center">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Saving?</h3>
                <p className="text-gray-300 mb-6">
                  These projections are based on typical results from similar businesses. 
                  Your actual savings may vary based on implementation and usage.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => setLocation('/')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Schedule Consultation
                  </Button>
                  <Button 
                    onClick={() => setLocation('/case-studies')}
                    variant="outline"
                    className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
                  >
                    See Case Studies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}