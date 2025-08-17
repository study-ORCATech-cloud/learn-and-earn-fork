import React from 'react';
import { Link } from 'react-router-dom';

const LearningPathNotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Learning Path Not Found</h1>
        <Link to="/learning-paths" className="text-blue-400 hover:text-blue-300">
          ← Back to Learning Paths
        </Link>
      </div>
    </div>
  );
};

export default LearningPathNotFound;