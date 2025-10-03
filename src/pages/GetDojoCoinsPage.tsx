import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { Coins, Zap, Shield, Star, CheckCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

// Define package interface to match backend structure
interface Package {
  id: string;
  name: string;
  description: string;
  package_type: 'one_time' | 'monthly_subscription' | 'yearly_subscription';
  coin_amount: number;
  price_usd: number;
  features: string[];
  // Add frontend-specific fields
  popular?: boolean;
}

// Package type configurations
const packageTypeConfig = {
  one_time: {
    title: 'One-Time Purchases',
    subtitle: 'Buy once, use forever - perfect for trying premium content',
    icon: '💎',
  },
  monthly_subscription: {
    title: 'Monthly Subscriptions',
    subtitle: 'Regular monthly coin delivery for consistent learners',
    icon: '🔄',
  },
  yearly_subscription: {
    title: 'Annual Subscriptions',
    subtitle: 'Best value with annual commitment - maximum savings',
    icon: '⭐',
  },
};

// Move benefits outside component too
const benefits = [
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Get immediate access to premium content after purchase'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'All payments processed through trusted third-party services - we never store your payment data'
  },
  {
    icon: Star,
    title: 'Premium Quality',
    description: 'Access detailed solutions, advanced tutorials, and exclusive content'
  }
];

// FAQ data
const faqData = [
  {
    question: "What can I do with Dojo Coins?",
    answer: "Dojo Coins let you access premium content like detailed solutions, advanced tutorials, bonus materials, and exclusive learning resources that aren't available for free."
  },
  {
    question: "Do Dojo Coins expire?",
    answer: "No, your Dojo Coins never expire. Once purchased, they remain in your account until you choose to spend them on premium content."
  },
  {
    question: "Are all labs free?",
    answer: "Yes, All hands-on labs remain completely free. Dojo Coins are only needed for premium supplementary content like detailed solutions and advanced materials."
  },
  {
    question: "Are all projects free?",
    answer: "Yes, All hands-on projects are completely free including resources, materials, solutions, and real-time running examples."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, All payments are processed through secure third-party services like Paddle. We never store or have access to your payment card details or banking information."
  },
  {
    question: "Can I get a refund?",
    answer: "No, we do not offer refunds for Dojo Coins once they have been purchased. Please ensure you are satisfied with your purchase before completing the transaction."
  }
];

const GetDojoCoinsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  // Fetch packages from backend
  const fetchPackages = async () => {
    try {
      setPackagesLoading(true);
      setPackagesError('');

      const backendUrl = import.meta.env.VITE_BACKEND_BASE_PATH;
      const response = await fetch(`${backendUrl}/api/v1/packages`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch packages: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract packages from response (assuming similar structure to transaction response)
      const packagesData = data.packages || data;
      
      if (!Array.isArray(packagesData)) {
        throw new Error('Invalid packages data received from server');
      }

      // Add frontend-specific fields to packages
      const processedPackages = packagesData.map((pkg: any, index: number) => ({
        ...pkg,
        popular: index === 1, // Mark second package as popular (you can adjust this logic)
      }));

      setPackages(processedPackages);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setPackagesError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setPackagesLoading(false);
    }
  };

  // Group packages by type
  const groupPackagesByType = (packages: Package[]) => {
    const grouped: Record<string, Package[]> = {};

    packages.forEach(pkg => {
      if (!grouped[pkg.package_type]) {
        grouped[pkg.package_type] = [];
      }
      grouped[pkg.package_type].push(pkg);
    });

    // Sort packages within each group by price (lowest to highest)
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => a.price_usd - b.price_usd);
    });

    return grouped;
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch packages when component mounts and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPackages();
    }
  }, [authLoading, isAuthenticated]);

  // Scroll to top after auth loading is complete and content is rendered
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Content is now fully rendered, scroll to top
      window.scrollTo(0, 0);
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handlePurchase = async (pack: Package) => {
    try {
      setPurchaseLoading(pack.id);
      
      const backendUrl = import.meta.env.VITE_BACKEND_BASE_PATH;
      const response = await fetch(`${backendUrl}/api/v1/purchase/initiate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_name: pack.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate purchase: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate purchase');
      }

      // Extract the paddle transaction ID from the response
      const paddleTransactionId = data.checkout.paddle_transaction_id;
      
      if (!paddleTransactionId) {
        throw new Error('No Paddle transaction ID received from server');
      }

      // Redirect to checkout page with the paddle transaction ID
      navigate(`/checkout?_ptxn=${paddleTransactionId}`);
      
    } catch (error) {
      console.error('Purchase initiation failed:', error);
      // You could show an error toast here
      alert(error instanceof Error ? error.message : 'Failed to start purchase process');
    } finally {
      setPurchaseLoading(null);
    }
  };


  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const toggleFeatures = (packageId: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId);
    } else {
      newExpanded.add(packageId);
    }
    setExpandedFeatures(newExpanded);
  };

  return (
    <>
      <Helmet>
        <title>Get Dojo Coins - Access Premium Learning Content</title>
        <meta name="description" content="Purchase Dojo Coins to access premium learning content including detailed solutions, advanced tutorials, and exclusive materials on LabDojo." />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Get Dojo Coins
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Unlock premium learning content with Dojo Coins. Access detailed solutions, 
              advanced tutorials, and exclusive materials to accelerate your learning journey.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose Dojo Coins?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-300">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-4 text-center">Choose Your Package</h2>
              <p className="text-lg text-slate-300 text-center mb-12">
                Select the perfect amount of Dojo Coins for your learning needs
              </p>
              
              {/* Loading State */}
              {packagesLoading && (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400 mx-auto mb-4" />
                    <p className="text-slate-300">Loading packages...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {packagesError && (
                <div className="text-center py-16">
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-400 mb-4">{packagesError}</p>
                    <button 
                      onClick={fetchPackages}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Packages by Type */}
              {!packagesLoading && !packagesError && (() => {
                const groupedPackages = groupPackagesByType(packages);
                const sortedTypes = ['one_time', 'monthly_subscription', 'yearly_subscription'].filter(type => groupedPackages[type]);
                
                return (
                  <div className="space-y-12">
                    {sortedTypes.map(packageType => (
                      <div key={packageType} className="">
                        {/* Section Header */}
                        <div className="text-center mb-8">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="text-3xl">{packageTypeConfig[packageType as keyof typeof packageTypeConfig].icon}</span>
                            <h3 className="text-3xl font-bold text-white">
                              {packageTypeConfig[packageType as keyof typeof packageTypeConfig].title}
                            </h3>
                          </div>
                          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            {packageTypeConfig[packageType as keyof typeof packageTypeConfig].subtitle}
                          </p>
                        </div>
                        
                        {/* Packages Grid for this type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" style={{ paddingTop: '1rem' }}>
                          {groupedPackages[packageType].map((pack, index) => (
                            <div 
                              key={pack.id || index} 
                              className={`relative p-6 rounded-lg border flex flex-col ${
                                pack.popular 
                                  ? 'bg-gradient-to-b from-yellow-500/10 to-orange-500/10 border-yellow-500/50' 
                                  : 'bg-slate-900/50 border-slate-800'
                              }`}
                              style={{ minHeight: '420px' }}
                            >
                              {pack.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                                    Most Popular
                                  </span>
                                </div>
                              )}
                              
                              <div className="text-center flex-grow flex flex-col">
                                {/* Header section - fixed height */}
                                <div className="mb-4">
                                  <h4 className="text-xl font-semibold text-white mb-2 min-h-[2rem]">{pack.name}</h4>
                                  <div className="mb-2">
                                    <span className="text-3xl font-bold text-yellow-400">{pack.coin_amount}</span>
                                    <span className="text-slate-400 ml-1">coins</span>
                                  </div>
                                  <div className="text-2xl font-bold text-white mb-2">${pack.price_usd}</div>
                                </div>
                                
                                {/* Description section - fixed height */}
                                <div className="mb-6" style={{ minHeight: '3rem' }}>
                                  <p className="text-slate-300 text-sm line-clamp-2">
                                    {pack.description || 'Premium package for enhanced learning experience'}
                                  </p>
                                </div>
                                
                                {/* Features section - flexible but controlled */}
                                <div className="flex-grow mb-6" style={{ minHeight: '8rem' }}>
                                  <ul className="space-y-2 text-left">
                                    {(pack.features && pack.features.length > 0) ? (
                                      <>
                                        {/* Always show first 4 features */}
                                        {pack.features.slice(0, 4).map((feature, featureIndex) => (
                                          <li key={featureIndex} className="flex items-start text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{feature}</span>
                                          </li>
                                        ))}
                                        
                                        {/* Show additional features if expanded */}
                                        {expandedFeatures.has(pack.id) && pack.features.slice(4).map((feature, featureIndex) => (
                                          <li key={featureIndex + 4} className="flex items-start text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{feature}</span>
                                          </li>
                                        ))}
                                        
                                        {/* Show/Hide more features button */}
                                        {pack.features.length > 4 && (
                                          <li>
                                            <button
                                              onClick={() => toggleFeatures(pack.id)}
                                              className="flex items-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                                            >
                                              {expandedFeatures.has(pack.id) ? (
                                                <>
                                                  <ChevronDown className="w-4 h-4 mr-1" />
                                                  Show less features
                                                </>
                                              ) : (
                                                <>
                                                  <ChevronRight className="w-4 h-4 mr-1" />
                                                  +{pack.features.length - 4} more features
                                                </>
                                              )}
                                            </button>
                                          </li>
                                        )}
                                      </>
                                    ) : (
                                      // Default features if none provided
                                      <>
                                        <li className="flex items-start text-sm text-slate-300">
                                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                          <span>Access to premium content</span>
                                        </li>
                                        <li className="flex items-start text-sm text-slate-300">
                                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                          <span>Detailed solutions and tutorials</span>
                                        </li>
                                        <li className="flex items-start text-sm text-slate-300">
                                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                          <span>Exclusive learning materials</span>
                                        </li>
                                      </>
                                    )}
                                  </ul>
                                </div>
                                
                                {/* Button section - fixed at bottom */}
                                <button 
                                  onClick={() => handlePurchase(pack)}
                                  disabled={purchaseLoading === pack.id}
                                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                    pack.popular
                                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                      : 'bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {purchaseLoading === pack.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Starting Purchase...
                                    </>
                                  ) : (
                                    'Purchase Now'
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left hover:bg-slate-800/50 transition-colors duration-200 flex items-center justify-between"
                    >
                      <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                      <div className="flex-shrink-0">
                        {expandedFaq === index ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>
                    
                    {expandedFaq === index && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-slate-700 pt-4">
                          <p className="text-slate-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Unlock Premium Content?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Start accessing detailed solutions and advanced learning materials today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/wallet">
                <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300">
                  View My Wallet
                </button>
              </Link>
              <Link to="/courses">
                <button className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                  Explore Courses
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default GetDojoCoinsPage;