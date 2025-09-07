import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { Coins, Zap, Shield, Star, CheckCircle, Copy, ExternalLink } from 'lucide-react';

const coinPackages = [
  {
    name: 'Starter Pack',
    coins: 25,
    price: '$4.99',
    description: 'Perfect for trying premium content',
    popular: false,
    valueProps: ['Great for beginners', 'Try before you buy more']
  },
  {
    name: 'Learning Pack',
    coins: 55,
    price: '$9.99',
    description: 'Great for active learners',
    popular: false,
    valueProps: ['10% bonus coins', 'Perfect for a few labs']
  },
  {
    name: 'Pro Pack',
    coins: 120,
    price: '$19.99',
    description: 'Perfect balance of value and quantity',
    popular: true,
    valueProps: ['20% bonus coins', 'Great all-around choice', 'Perfect for multiple labs']
  },
  {
    name: 'Master Pack',
    coins: 325,
    price: '$49.99',
    description: 'Best value for serious developers',
    popular: false,
    valueProps: ['35% bonus coins', 'Maximum savings', 'Perfect for multiple courses', 'Extended learning journey']
  }
];

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

const GetOrcaCoinsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [purchaseData, setPurchaseData] = useState<{
    pack: typeof coinPackages[0];
    userEmail: string;
    packageDetails: string;
    amount: string;
  } | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

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

  const handlePurchase = (pack: typeof coinPackages[0]) => {
    const userEmail = user?.email || 'no-email-provided';
    const packageDetails = `${pack.name} - ${pack.coins} Orca Coins`;
    const amount = pack.price.replace('$', '');
    
    // Set purchase data for modal
    setPurchaseData({
      pack,
      userEmail,
      packageDetails,
      amount
    });
  };

  const handleCopyUserEmail = async () => {
    if (!purchaseData) return;
    
    try {
      await navigator.clipboard.writeText(purchaseData.userEmail);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = purchaseData.userEmail;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    }
  };

  const handleContinueToPayPal = () => {
    if (!purchaseData) return;
    
    const paypalUrl = `https://paypal.me/ORCATechCloud/${purchaseData.amount}`;
    window.open(paypalUrl, '_blank');
    setPurchaseData(null);
  };

  return (
    <>
      <Helmet>
        <title>Get Orca Coins - Access Premium Learning Content</title>
        <meta name="description" content="Purchase Orca Coins to access premium learning content including detailed solutions, advanced tutorials, and exclusive materials on ORCATech." />
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
                Get Orca Coins
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Unlock premium learning content with Orca Coins. Access detailed solutions, 
              advanced tutorials, and exclusive materials to accelerate your learning journey.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose Orca Coins?</h2>
              
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
                Select the perfect amount of Orca Coins for your learning needs
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {coinPackages.map((pack, index) => (
                  <div 
                    key={index} 
                    className={`relative p-6 rounded-lg border h-full flex flex-col ${
                      pack.popular 
                        ? 'bg-gradient-to-b from-yellow-500/10 to-orange-500/10 border-yellow-500/50' 
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center flex-grow flex flex-col">
                      <h3 className="text-xl font-semibold text-white mb-2">{pack.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-yellow-400">{pack.coins}</span>
                        <span className="text-slate-400 ml-1">coins</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">{pack.price}</div>
                      <p className="text-slate-300 text-sm mb-6">{pack.description}</p>
                      
                      <ul className="space-y-2 mb-6 text-left flex-grow">
                        {pack.valueProps.map((valueProp, valueIndex) => (
                          <li key={valueIndex} className="flex items-center text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                            {valueProp}
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        onClick={() => handlePurchase(pack)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 mt-auto ${
                          pack.popular
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        Purchase Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-2">What can I do with Orca Coins?</h3>
                  <p className="text-slate-300">
                    Orca Coins let you access premium content like detailed solutions, advanced tutorials, 
                    bonus materials, and exclusive learning resources that aren't available for free.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Do Orca Coins expire?</h3>
                  <p className="text-slate-300">
                    No, your Orca Coins never expire. Once purchased, they remain in your account 
                    until you choose to spend them on premium content.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Are all labs free?</h3>
                  <p className="text-slate-300">
                    Yes! All hands-on labs remain completely free. Orca Coins are only needed for 
                    premium supplementary content like detailed solutions and advanced materials.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Is my payment information secure?</h3>
                  <p className="text-slate-300">
                    Yes! All payments are processed through secure third-party services like PayPal. 
                    We never store or have access to your payment card details or banking information.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Can I get a refund?</h3>
                  <p className="text-slate-300">
                    We offer refunds within 7 days of purchase if you haven't used any of your Orca Coins. 
                    Contact our support team for assistance.
                  </p>
                </div>
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

        {/* Purchase Confirmation Modal */}
        {purchaseData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-md w-full p-6 relative">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h3>
                <p className="text-slate-300">You're about to purchase:</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-white">{purchaseData.pack.name}</h4>
                  <div className="text-2xl font-bold text-yellow-400 my-2">
                    {purchaseData.pack.coins} Coins
                  </div>
                  <div className="text-xl text-white">{purchaseData.pack.price}</div>
                </div>
              </div>

              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 mb-6">
                <div className="text-sm text-orange-200 mb-3">
                  <strong>IMPORTANT:</strong> Please include your email in your PayPal payment message:
                </div>
                
                <div className="bg-slate-800 rounded p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-mono text-white break-all mr-2">
                      {purchaseData.userEmail}
                    </div>
                    <button
                      onClick={handleCopyUserEmail}
                      className="flex-shrink-0 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                      title="Copy User Email"
                    >
                      <Copy className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContinueToPayPal}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Continue to PayPal
                </button>
                
                <button
                  onClick={() => setPurchaseData(null)}
                  className="w-full bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                <div className="text-xs text-blue-200">
                  <strong>Instructions:</strong> Copy your email above, then click "Continue to PayPal". 
                  When making your payment, paste your email in the message field so we can process your coin grant quickly.
                </div>
              </div>

              {/* Copy Success Toast */}
              {showCopyToast && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Email copied!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GetOrcaCoinsPage;