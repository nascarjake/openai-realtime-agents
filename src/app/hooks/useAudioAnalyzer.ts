"use client";

import { useEffect, useState, useRef } from 'react';

// Hook to analyze audio volume from an audio element
export default function useAudioAnalyzer(audioElement: HTMLAudioElement | null) {
  const [volume, setVolume] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSetupRef = useRef<boolean>(false);

  // Set up audio analyzer
  useEffect(() => {
    if (!audioElement || isSetupRef.current) return;

    try {
      // Initialize audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Create analyzer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Create buffer
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      // Connect to audio element - this can throw an error if the element 
      // is already connected to another audio context
      try {
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;
        isSetupRef.current = true;
      } catch (err) {
        console.warn("Could not create media element source. This is expected if the element already has a source:", err);
        // Even if we can't create a source, we can still analyze volume from the context
        isSetupRef.current = true;
      }
      
      // Start analysis
      const analyzeVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        // If we have a valid analyzer, get volume data
        try {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          // Calculate average volume from frequency data
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          
          const avgVolume = sum / dataArrayRef.current.length / 255; // Normalize to 0-1
          setVolume(avgVolume);
        } catch (err) {
          // If we can't get data, use a simulated volume
          console.warn("Error analyzing audio - using fallback pulse:", err);
          // Generate a simulated pulse when we can't analyze the real audio
          const simulatedVolume = Math.pow(Math.sin(Date.now() / 300) * 0.5 + 0.5, 2) * 0.3;
          setVolume(simulatedVolume);
        }
        
        // Continue analyzing
        animationFrameRef.current = requestAnimationFrame(analyzeVolume);
      };
      
      analyzeVolume();
    } catch (err) {
      console.error("Error setting up audio analyzer:", err);
      // If setup fails, create a simulated pulse
      const simulateVolume = () => {
        const simulatedVolume = Math.pow(Math.sin(Date.now() / 300) * 0.5 + 0.5, 2) * 0.3;
        setVolume(simulatedVolume);
        animationFrameRef.current = requestAnimationFrame(simulateVolume);
      };
      simulateVolume();
    }
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (err) {
          console.warn("Error disconnecting audio source:", err);
        }
      }
    };
  }, [audioElement]);
  
  return volume;
} 