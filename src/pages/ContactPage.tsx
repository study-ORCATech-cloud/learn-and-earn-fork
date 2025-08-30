
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Send, MessageCircle, Phone } from 'lucide-react';
import Header from '../components/layout/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<any>(null);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Try mailto first
    const mailtoLink = 'mailto:orca.tech.work@gmail.com';
    window.location.href = mailtoLink;
    
    // Provide fallback after a short delay
    setTimeout(() => {
      const gmailLink = 'https://mail.google.com/mail/?view=cm&fs=1&to=orca.tech.work@gmail.com';
      const confirmed = window.confirm(
        'If your email client didn\'t open, would you like to open Gmail in your browser instead?'
      );
      if (confirmed) {
        window.open(gmailLink, '_blank');
      }
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and success state
    setErrors({});
    setSuccessData(null);
    setIsSubmitting(true);
    
    try {
      // Prepare request data - only include fields that have values
      const requestData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      };
      
      // Add optional fields if they have values
      if (formData.last_name.trim()) {
        requestData.last_name = formData.last_name.trim();
      }
      
      if (formData.phone_number.trim()) {
        requestData.phone_number = formData.phone_number.trim();
      }
      
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_PATH || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success - show success message and reset form
        setSuccessData(data);
        setFormData({ name: '', last_name: '', email: '', phone_number: '', message: '' });
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      } else {
        // Handle validation errors
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.keys(data.errors).forEach(field => {
            fieldErrors[field] = data.errors[field][0]; // Take the first error message
          });
          setErrors(fieldErrors);
        }
        
        // Show general error message
        toast.error(data.message || 'Please correct the errors and try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - ORCATech Learning Platform</title>
        <meta name="description" content="Get in touch with ORCATech. Contact us for questions about our learning platform, courses, or partnership opportunities." />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform or want to collaborate? 
              We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Get In Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Email Us</h3>
                      <p className="text-slate-300 mb-2">Send us an email and we'll get back to you soon.</p>
                      <button 
                        onClick={handleEmailClick}
                        className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        orca.tech.work@gmail.com
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Join Our Community</h3>
                      <p className="text-slate-300 mb-2">Explore our labs and connect with other learners.</p>
                      <a 
                        href="https://github.com/study-ORCATech-cloud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        GitHub Community
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2 bg-slate-900/50 rounded-lg p-8 border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        maxLength={100}
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-slate-700'
                        }`}
                        placeholder="Your first name"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        maxLength={100}
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.last_name ? 'border-red-500' : 'border-slate-700'
                        }`}
                        placeholder="Your last name"
                      />
                      {errors.last_name && (
                        <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        maxLength={120}
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-slate-700'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        maxLength={20}
                        value={formData.phone_number}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone_number ? 'border-red-500' : 'border-slate-700'
                        }`}
                        placeholder="+1234567890"
                      />
                      {errors.phone_number && (
                        <p className="text-red-400 text-sm mt-1">{errors.phone_number}</p>
                      )}
                    </div>
                  </div>
                  
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      minLength={10}
                      maxLength={2000}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors.message ? 'border-red-500' : 'border-slate-700'
                      }`}
                      placeholder="Tell us more about your inquiry... (minimum 10 characters)"
                    />
                    {errors.message && (
                      <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">
                      {formData.message.length}/2000 characters (minimum 10 required)
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  
                  {/* Success Message */}
                  {successData && (
                    <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
                      <h4 className="text-green-400 font-semibold mb-2">✅ Message Sent Successfully!</h4>
                      <p className="text-green-200 mb-2">{successData.message}</p>
                      <p className="text-green-300 text-sm">
                        <strong>Reference ID:</strong> {successData.reference_id}
                      </p>
                      {successData.acknowledgment_email_sent ? (
                        <p className="text-green-300 text-sm mt-1">✅ Confirmation email sent to your address</p>
                      ) : (
                        <p className="text-yellow-300 text-sm mt-1">⚠️ Confirmation email could not be sent</p>
                      )}
                    </div>
                  )}
                  
                  {/* Rate Limit Error */}
                  {errors.rate_limit && (
                    <div className="mt-4 p-4 bg-orange-900/50 border border-orange-700 rounded-lg">
                      <p className="text-orange-400 text-sm">
                        <strong>⚠️ Rate Limit:</strong> {errors.rate_limit}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
