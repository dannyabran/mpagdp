import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import '../App.css';
import VideoControls from './VideoControls';
import ReactDOMServer from 'react-dom/server';
import * as Icon from 'react-bootstrap-icons';

const VideoPlayer = forwardRef(({ selectedVideo }, ref) => {
  const videoRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const [timeText, setTimeText] = useState("00:00");
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
  }));

  useEffect(() => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;

    if (!video || !progressBar) return; 

    const finalVolume = muted ? 0 : volume ** 2;
    video.volume = finalVolume;

    const togglePlay = () => {
      if (video.paused || video.ended) {
        video.play();
      } else {
        video.pause();
      }
    };

    const updateToggleButton = () => {
      if (toggleButtonRef.current) {
        toggleButtonRef.current.innerHTML = video.paused 
          ? ReactDOMServer.renderToString(<Icon.PlayFill color='#f4f0e7' size={30}/>) 
          : ReactDOMServer.renderToString(<Icon.PauseFill color='#f4f0e7' size={30}/>);
      }
    };

    const handleProgress = () => {
      if (progressBar) {
        const progressPercentage = (video.currentTime / video.duration) * 100;
        progressBar.style.flexBasis = `${progressPercentage}%`;
      }
    };

    const updateCurrentTimeDisplay = () => {
      const minutes = Math.floor(video.currentTime / 60);
      const seconds = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
      setTimeText(`${minutes}:${seconds}`);
    };

    const scrub = (e) => {
      if (progressRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const scrubTime = (offsetX / rect.width) * video.duration;
        video.currentTime = scrubTime;
      }
    };

    if (toggleButtonRef.current) {
      toggleButtonRef.current.addEventListener('click', togglePlay);
    }
    video.addEventListener('play', updateToggleButton);
    video.addEventListener('pause', updateToggleButton);
    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('timeupdate', updateCurrentTimeDisplay);
    if (progressRef.current) {
      progressRef.current.addEventListener('click', scrub);
    }

    return () => {
      if (toggleButtonRef.current) {
        toggleButtonRef.current.removeEventListener('click', togglePlay);
      }
      if (video) {
        video.removeEventListener('play', updateToggleButton);
        video.removeEventListener('pause', updateToggleButton);
        video.removeEventListener('timeupdate', handleProgress);
        video.removeEventListener('timeupdate', updateCurrentTimeDisplay);
      }
      if (progressRef.current) {
        progressRef.current.removeEventListener('click', scrub);
      }
    };
  }, [selectedVideo, volume, muted]);

  return (
    <div id="video">
      <video ref={videoRef} key={selectedVideo} playsInline>
        <source src={selectedVideo} type="video/mp4"></source>
      </video>
      <VideoControls
        toggleButtonRef={toggleButtonRef}
        progressRef={progressRef}
        progressBarRef={progressBarRef}
        timeText={timeText}
        volume={volume}
        setVolume={setVolume}
        muted={muted}
        setMuted={setMuted}
      />
    </div>
  );
});

export default VideoPlayer;
