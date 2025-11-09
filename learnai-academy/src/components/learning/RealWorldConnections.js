'use client';

import { useState, useEffect } from 'react';
import { Globe, Sparkles, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import engagementService from '@/services/curriculum/engagementService';

/**
 * RealWorldConnections - Displays real-world connections to lesson content
 * 
 * Features:
 * - Student interest connections
 * - Practical applications
 * - Age-appropriate examples
 */
export default function RealWorldConnections({ 
  lessonPlan, 
  subjectSlug, 
  gradeLevel 
}) {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const data = await engagementService.generateRealWorldConnections(
          lessonPlan,
          subjectSlug,
          gradeLevel
        );
        setConnections(data);
      } catch (error) {
        console.error('Error loading real-world connections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonPlan && subjectSlug && gradeLevel) {
      loadConnections();
    }
  }, [lessonPlan, subjectSlug, gradeLevel]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Loading connections...</p>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Real-World Connections</h3>
      </div>

      <p className="text-gray-700 mb-6">
        See how this lesson connects to the world around you!
      </p>

      <div className="space-y-4">
        {connections.map((connection, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Link2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{connection.connection}</h4>
                {connection.example && (
                  <div className="bg-indigo-50 rounded-lg p-3 mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Example:</span> {connection.example}
                    </p>
                  </div>
                )}
                {connection.relevance && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Why it matters:</span> {connection.relevance}
                  </p>
                )}
              </div>
              <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

