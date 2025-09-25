import React from 'react';
import Lottie from 'lottie-react';
import wigAnimationData from '@/assets/images/wig.json';

interface WiglooAnimationProps {
  className?: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export const WiglooAnimation: React.FC<WiglooAnimationProps> = ({
  className = '',
  width,
  height,
  loop = true,
  autoplay = true,
}) => {
  const style = {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  };

  return (
    <div className={className} style={style}>
      <Lottie
        animationData={wigAnimationData}
        loop={loop}
         height="500px"
        autoplay={autoplay}
        // style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default WiglooAnimation;
