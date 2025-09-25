import React from 'react';
import { useNavigate } from 'react-router-dom';
import issue from '@/assets/images/issue.png';
import { ChevronLeft } from 'lucide-react';


const SummaryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={"min-h-screen px-5 py-10"} style={{ backgroundColor: '#F9F0CB' }}>

    {/* Main Card */}
    <div className={"bg-white mt-8 rounded-3xl p-8 mb-4"}>
      <img
            src={issue}
            className="w-full h-full object-contain"
          />
    </div>

    {/* Next Button */}
    <button
      onClick={() => {
        navigate('/tutorial-intro')
      }}
      className="w-full py-4 mt-10 rounded-full text-[#333333] font-bold text-lg shadow-lg hover:shadow-xl transition-shadow bg-[#FFD934]"
      style={{
        boxShadow: '0px 6px 0px 4px #FAAD61'
      }}
    >
      Create improvement plan
    </button>
  </div>
  );
};

export default SummaryPage;
