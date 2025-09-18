import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export const FaceDetectionTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<string>('Loading...');
  const [detectionResults, setDetectionResults] = useState<string>('');

  useEffect(() => {
    const initializeDetection = async () => {
      try {
        console.log('🚀 Starting face detection test...');
        
        // Load models
        setModelStatus('Loading TensorFlow backend...');
        await faceapi.tf.ready();
        console.log('✅ TensorFlow backend ready');
        
        setModelStatus('Loading face detection models...');
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        console.log('✅ Models loaded successfully');
        setModelStatus('Models loaded - Starting camera...');
        
        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Camera started');
            setModelStatus('Ready - Testing detection...');
            setIsLoading(false);
            startDetection();
          };
        }
        
      } catch (err) {
        console.error('❌ Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    const startDetection = () => {
      const detect = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        try {
          // Test different detection options
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.3
            }))
            .withFaceExpressions();

          // Clear canvas
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          if (detections.length > 0) {
            const detection = detections[0];
            const expressions = detection.expressions;
            
            // Draw bounding box
            if (ctx) {
              const box = detection.detection.box;
              ctx.strokeStyle = 'red';
              ctx.lineWidth = 2;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
            
            // Log results
            const emotionScores = Object.entries(expressions)
              .map(([emotion, conf]) => `${emotion}: ${Math.round(conf * 100)}%`)
              .join(', ');
            
            setDetectionResults(`Face detected! Emotions: ${emotionScores}`);
            console.log('🔍 Detection result:', emotionScores);
          } else {
            setDetectionResults('No face detected');
            console.log('👤 No face detected');
          }
        } catch (err) {
          console.error('❌ Detection error:', err);
          setDetectionResults(`Detection error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      };

      // Run detection every 500ms for testing
      const interval = setInterval(detect, 500);
      return () => clearInterval(interval);
    };

    initializeDetection();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800">Face Detection Test</h3>
        <p className="text-blue-600">{modelStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h3 className="font-bold text-red-800">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="font-bold text-green-800">Face Detection Test</h3>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md border rounded"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          width={640}
          height={480}
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>
      <p className="text-green-600 mt-2 text-sm">{detectionResults}</p>
    </div>
  );
};
