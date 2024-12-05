import React, {useState, useEffect, CSSProperties} from 'react';
import './css/pomodoroAnimation.css';

function PomodoroAnimation(data) {

    const [penciltime, setPencilTime] = useState('0s');
    const [linetime, setLineTime] = useState('0s');
    const [delayGo, setDelayGo] = useState('0s');
    const [delayBack, setDelayBack] = useState('0s')
    const [play, setPlay] = useState(false);
    const [isStudioTime, setIsStudioTime] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);

  const restartAnimation = () => {
    setAnimationKey(prevKey => prevKey + 1);
  };

    useEffect(() => {
        if (data.isStudioTime) {
            setPencilTime(`${data.studioTime}s`);
            setLineTime(`${(data.studioTime*0.8)}s`);
            setDelayGo(`${(data.studioTime*0.2)}s`);
            setDelayBack(`${(data.studioTime*0.1)}s`);
        } else {
            setPencilTime(`${data.breakTime}s`);
            setLineTime(`${(data.breakTime*0.8)}s`);
            setDelayGo(`${(data.breakTime*0.2)}s`);
            setDelayBack(`${(data.breakTime*0.1)}s`);
        }
        setPlay(data.isPlaying);
        setIsStudioTime(data.isStudioTime);

        if (data.reset) {
            restartAnimation();
            data.setReset(false);
        }

    } , [data]);


    useEffect(() => {
        document.documentElement.style.setProperty('--animation-duration-pencil', penciltime);
        document.documentElement.style.setProperty('--animation-duration-line', linetime);
        document.documentElement.style.setProperty('--animation-delay-go', delayGo);
        document.documentElement.style.setProperty('--animation-delay-back', delayBack);

    } , [penciltime, linetime, delayGo, delayBack]);



    useEffect(() => {
        if (play) {
            document.documentElement.style.setProperty('--animation-running', 'running');
        } else {
            document.documentElement.style.setProperty('--animation-running', 'paused');
        }
    } , [play]);


   

    return (
        <div className="pomodoro-animation">
            <div>
                <div key={animationKey} className={isStudioTime ? 'pencil study-pencil' : 'pencil break-pencil'}>
                    <span class="lapisContent"></span>
                    
                    <span
                        className={isStudioTime ? 'conteudoStudy conteudo' : 'conteudoBreak conteudo'}>
                    </span>
                </div>
                <span
                    className={isStudioTime ? 'line lineStudy' : 'line lineBreak'}>
                </span>
            </div>
        </div>
    );
}
export default PomodoroAnimation;
