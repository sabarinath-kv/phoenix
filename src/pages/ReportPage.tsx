import React, { useEffect, useState } from 'react';
import { FocusSpanSlider } from '@/components/FocusSpanSlider';
import { useNavigate } from 'react-router-dom';
import report1Image from '@/assets/images/report1.png';
import { getProfileSummary, generateReport, Summary } from '@/api/apis';
import { useAuth } from '@/contexts/AuthContext';
import FinalReport from '@/components/FinalReportt';
import strength from '@/assets/images/strength.png';
import report3 from '@/assets/images/report3.png';
import working from '@/assets/images/working.png';
import alam from '@/assets/images/alam.png';
import eye from '@/assets/images/eye.png';
import mental from '@/assets/images/mental.png';

interface SlideData {
  id: number;
  title: string;
  currentTime: string;
  maxTime: string;
  progress: number;
  recommendation: string;
  imageSrc: string;
  imageAlt: string;
  type: Summary;
  sub: string;
  value: string;
}

const imageMap = {
    [Summary.adhd_risk]: strength,
    [Summary.strength_spotlight]: strength,
    [Summary.attention_focus]: report1Image,
    [Summary.response_style]: report3,
    [Summary.working_style]: working,
    [Summary.rhythm_consistency]: strength,
    [Summary.visual_tracking]: strength,
    [Summary.anxiety_signals]: strength,
    [Summary.learning_style]: report3,
}

const subImageMap = {
    [Summary.adhd_risk]: strength,
    [Summary.strength_spotlight]: mental,
    [Summary.attention_focus]: report1Image,
    [Summary.response_style]: alam,
    [Summary.working_style]: mental,
    [Summary.rhythm_consistency]: strength,
    [Summary.visual_tracking]: mental,
    [Summary.anxiety_signals]: mental,
    [Summary.learning_style]: eye,
}


const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, insights } = useAuth();
  const [showFinal, setShowFinal] = useState(false)
  

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const { insights: insigt } = useAuth();
  


  useEffect(() => {
    const getSlides = async () => {
    //   await generateReport(user?.id);
        const summaries = await getProfileSummary(user?.id);
        console.log("summaries", summaries);
        if (summaries) {    
        setCurrentSlideIndex(0);
        setSlides(summaries.filter((insight) => insight.summaryName != Summary.summary_profile).map((insight) => ({
          id: insight.index,
          title: insight.title,
          sub: insight.sub_label,
          currentTime: insight.value,
          maxTime: "15 min",
          progress: 20,
          recommendation: insight.message,
          imageSrc: imageMap[insight.summaryName],
          imageAlt: subImageMap[insight.summaryName],
          type: insight.summaryName,
          value: insight.value
        })));
      }
     
    }
    getSlides()
  }, []) 
  const handleProgressChange = (progress: number) => {
    // Update the slide data progress if needed
    slides[currentSlideIndex].progress = progress;
  };

  const handleNext = () => {
    if (currentSlideIndex == slides.length - 1) {
        setShowFinal(true)
    }
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
    } else {
      // Navigate to next page or complete
      console.log('Report complete!');
      // You can navigate to another page here
      // navigate('/next-page');
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    console.log("slidessss1", currentSlideIndex);
    console.log("slidessss", slides);
    if (currentSlideIndex == slides.length && currentSlideIndex != 0) {
      setShowFinal(true)
    }
  }, [currentSlideIndex, slides]);


  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#F9F0CB' }}>
      {slides.length === 0 ? <div></div> : showFinal ? 
      <FinalReport name={user.metadata?.voice_assessment?.summary?.child_name} value={slides[currentSlideIndex].value}
        imageSrc={slides[currentSlideIndex].imageSrc}
        imageAlt={slides[currentSlideIndex].imageAlt}
        title={slides[currentSlideIndex].title}
        currentTime={slides[currentSlideIndex].currentTime}
        maxTime={slides[currentSlideIndex].maxTime}
        progress={slides[currentSlideIndex].progress}
        recommendation={slides[currentSlideIndex].recommendation}
        currentSlide={currentSlideIndex + 1}
        totalSlides={slides.length}
        type={slides[currentSlideIndex].type}
        interactive={true}
        onProgressChange={handleProgressChange}
        onNext={handleNext}
        onBack={handleBack} /> : <FocusSpanSlider
      value={slides[currentSlideIndex].value}
        imageSrc={slides[currentSlideIndex].imageSrc}
        imageAlt={slides[currentSlideIndex].imageAlt}
        sub={slides[currentSlideIndex].sub}
        title={slides[currentSlideIndex].title}
        currentTime={slides[currentSlideIndex].currentTime}
        maxTime={slides[currentSlideIndex].maxTime}
        progress={slides[currentSlideIndex].progress}
        recommendation={slides[currentSlideIndex].recommendation}
        currentSlide={currentSlideIndex + 1}
        totalSlides={slides.length}
        type={slides[currentSlideIndex].type}
        interactive={true}
        onProgressChange={handleProgressChange}
        onNext={handleNext}
        onBack={handleBack}
      />}
    </div>
  );
};

export default ReportPage;
