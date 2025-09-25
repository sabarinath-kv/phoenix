import React from 'react';
import { useNavigate } from 'react-router-dom';
import issue from '@/assets/images/issue.png';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';


const Expert: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={"min-h-screen px-5 py-10"} style={{ backgroundColor: '#F9F0CB' }}>
    {/* Back Button */}

    {/* Main Card */}
    <div className={"bg-white mt-10 rounded-3xl p-8 mb-4"}>
      <img
            src={issue}
            className="w-full h-full object-contain"
          />
    </div>

    {/* Next Button */}
    <button
      onClick={() => {
        navigate('/expert-listing')
      }}
      className="w-full py-4 mt-10 rounded-full text-[#333333] font-bold text-lg shadow-lg hover:shadow-xl transition-shadow bg-[#FFD934]"
      style={{
        boxShadow: '0px 6px 0px 4px #FAAD61'
      }}
    >
      Meet our Therapists
    </button>
    <button
      onClick={() => {
        navigate('/tutorial-intro')
      }}
      className="w-full py-4 mt-6 rounded-full text-[#333333] font-bold text-lg shadow-lg hover:shadow-xl transition-shadow bg-[white]"
      style={{
        boxShadow: '0px 6px 0px 4px #D4D1D2'
      }}
    >
      I’ll think about it and come back
    </button>
  </div>
  );
};

export default Expert;
