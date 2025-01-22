import { CheckIcon } from 'lucide-react';
import { Button } from '@srcbook/components/src/components/ui/button';
import { useNavigate } from 'react-router-dom';

const tiers = [
  {
    name: 'Starter',
    price: 99,
    description: 'Perfect for individual developers and small projects',
    features: [
      'Up to 5 active projects',
      'Basic AI assistance',
      'Standard support',
      'Community access',
      'Basic integrations'
    ],
    buttonText: 'Get Started',
    highlighted: false
  },
  {
    name: 'Professional',
    price: 199,
    description: 'Ideal for growing teams and businesses',
    features: [
      'Unlimited projects',
      'Advanced AI capabilities',
      'Priority support',
      'Team collaboration',
      'Advanced integrations',
      'Custom workflows',
      'Analytics dashboard'
    ],
    buttonText: 'Try Professional',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 499,
    description: 'For large organizations requiring maximum capabilities',
    features: [
      'Everything in Professional',
      'Dedicated support',
      'Custom AI models',
      'Enterprise security',
      'API access',
      'SLA guarantees',
      'Custom training',
      'Unlimited storage'
    ],
    buttonText: 'Contact Sales',
    highlighted: false
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400">
            Choose the perfect plan for your development needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl backdrop-blur-xl border ${
                tier.highlighted
                  ? 'border-red-500 bg-gradient-to-b from-red-950/30 to-black/50'
                  : 'border-gray-800 bg-black/40'
              } p-8 shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              {tier.highlighted && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <div className="bg-red-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl font-bold text-white">${tier.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400 mb-6 min-h-[48px]">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  onClick={() => navigate('/settings')}
                  className={`w-full py-6 ${
                    tier.highlighted
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  } text-white font-semibold rounded-lg transition-colors duration-200`}
                >
                  {tier.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-gray-500">
            Need a custom plan?{' '}
            <a href="mailto:sales@codelive.ai" className="text-red-500 hover:text-red-400">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 