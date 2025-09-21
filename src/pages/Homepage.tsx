import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Gamepad2, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Trophy,
  Brain
} from 'lucide-react';

// Mock data
const mockUser = { name: "Sarah" };

const mockInsights = {
  lastGame: "Memory Match",
  lastScore: 82,
  progress: "Improved focus by 10% since last week",
  lastScreening: "2025-09-15"
};

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const actionButtons = [
    {
      title: "View Detailed Insights",
      description: "Track your child's progress",
      icon: BarChart3,
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600",
      route: "/insights"
    },
    {
      title: "Connect with Experts",
      description: "Get professional guidance",
      icon: Users,
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600",
      route: "/experts"
    },
    {
      title: "Do Game Exercises",
      description: "Fun learning activities",
      icon: Gamepad2,
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
      route: "/"
    },
    {
      title: "Community",
      description: "Connect with other parents",
      icon: MessageCircle,
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600",
      route: "/community"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-semibold text-gray-700"
            variants={itemVariants}
          >
            Hi {mockUser.name} 👋
          </motion.h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Welcome back! Let's continue supporting your child's development journey together.
          </p>
        </motion.div>

        {/* Brief Insights Section */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Recent Progress</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Here's a quick snapshot of your child's recent activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Last Game */}
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Game</p>
                    <p className="font-semibold text-gray-800">{mockInsights.lastGame}</p>
                  </div>
                </div>

                {/* Last Score */}
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Latest Score</p>
                    <p className="font-semibold text-gray-800">{mockInsights.lastScore}%</p>
                  </div>
                </div>

                {/* Last Screening */}
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Screening</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(mockInsights.lastScreening).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Highlight */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Progress Update</p>
                    <p className="text-gray-800 font-medium">{mockInsights.progress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionButtons.map((button, index) => {
              const IconComponent = button.icon;
              return (
                <motion.div
                  key={button.title}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 border-2 ${button.color} shadow-lg hover:shadow-xl rounded-2xl overflow-hidden`}
                    onClick={() => navigate(button.route)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${button.color.replace('hover:', '').replace('bg-', 'bg-').replace('-50', '-100')}`}>
                          <IconComponent className={`w-6 h-6 ${button.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {button.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {button.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer Spacing */}
        <div className="h-8"></div>
      </div>
    </motion.div>
  );
};

export { Homepage }; 