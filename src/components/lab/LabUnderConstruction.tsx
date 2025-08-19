// Lab under construction component for 403 errors

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Clock, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LabUnderConstructionProps {
  courseName?: string;
  courseId?: string;
  labName?: string;
}

const LabUnderConstruction: React.FC<LabUnderConstructionProps> = ({
  courseName,
  courseId,
  labName
}) => {
  const navigate = useNavigate();

  const handleBackToCourse = () => {
    if (courseId) {
      navigate(`/course/${courseId}`);
    } else {
      navigate('/');
    }
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-2xl w-full mx-4 bg-slate-900/50 border-slate-700">
        <CardContent className="p-12 text-center space-y-6">
          {/* Construction Icon */}
          <div className="relative">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Construction className="w-10 h-10 text-yellow-400" />
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-2">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-300 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Under Construction
          </Badge>

          {/* Main Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">
              Lab Under Construction
            </h1>
            
            {labName && (
              <h2 className="text-xl text-slate-300">
                {labName}
              </h2>
            )}
            
            <div className="space-y-3 text-slate-400">
              <p className="text-lg leading-relaxed">
                This lab is currently in the testing stage and not yet available for students.
              </p>
              <p>
                Our development team is working hard to bring you high-quality content. 
                Please check back soon!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            {courseName && courseId ? (
              <Button 
                onClick={handleBackToCourse}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {courseName}
              </Button>
            ) : (
              <Button 
                onClick={handleBackToCourse}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
            )}
            
            <Button 
              onClick={handleBackToCourses}
              variant="outline"
              size="lg"
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              Explore Other courses
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Construction className="w-4 h-4" />
              <span>Expected completion status will be updated soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabUnderConstruction;