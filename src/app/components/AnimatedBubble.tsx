"use client";

import React, { useEffect, useRef } from "react";

interface AnimatedBubbleProps {
  isUserSpeaking: boolean;
  isAIResponding: boolean;
}

const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({
  isUserSpeaking,
  isAIResponding,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Animation constants
  const particleCount = 30;
  const particles: {
    x: number;
    y: number;
    radius: number;
    color: string;
    speed: number;
    angle: number;
  }[] = [];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const setCanvasSize = () => {
      const parentNode = canvas.parentNode as HTMLElement | null;
      if (!parentNode) return;
      
      canvas.width = parentNode.offsetWidth;
      canvas.height = parentNode.offsetHeight;
    };
    
    // Initialize canvas size
    setCanvasSize();
    
    // Handle window resize
    window.addEventListener("resize", setCanvasSize);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: isUserSpeaking ? "#3B82F6" : "#10B981", // Blue for user, green for AI
        speed: Math.random() * 2 + 0.5,
        angle: Math.random() * Math.PI * 2,
      });
    }
    
    const drawParticles = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
      
      // Draw base circle with gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        maxRadius * 0.2,
        centerX,
        centerY,
        maxRadius
      );
      
      if (isUserSpeaking) {
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)"); // Blue
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      } else if (isAIResponding) {
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)"); // Green
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.1)");
      } else {
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)"); // White/neutral
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Only animate particles if speaking or responding
      if (isUserSpeaking || isAIResponding) {
        const amplitude = isUserSpeaking || isAIResponding ? 1.0 : 0.2;
        
        // Draw and update particles
        for (const particle of particles) {
          // Update color based on who's active
          particle.color = isUserSpeaking ? "#3B82F6" : "#10B981";
          
          // Draw particle
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Update position with bounce logic
          const distFromCenter = Math.sqrt(
            Math.pow(particle.x - centerX, 2) + 
            Math.pow(particle.y - centerY, 2)
          );
          
          // Bounce particles inside the main circle
          if (distFromCenter > maxRadius - particle.radius) {
            // Calculate bounce angle
            const angleToCenter = Math.atan2(centerY - particle.y, centerX - particle.x);
            particle.angle = angleToCenter + Math.PI + (Math.random() * 0.5 - 0.25);
          }
          
          // Random small angle variations to make it more natural
          if (Math.random() < 0.05) {
            particle.angle += (Math.random() * 0.4 - 0.2);
          }
          
          // Move particles
          particle.x += Math.cos(particle.angle) * particle.speed * amplitude;
          particle.y += Math.sin(particle.angle) * particle.speed * amplitude;
        }
      }
    };
    
    const animate = () => {
      drawParticles();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isUserSpeaking, isAIResponding]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0"
    />
  );
};

export default AnimatedBubble; 