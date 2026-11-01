import React from 'react'
import { Composition } from 'remotion'
import { DURATION, FPS, HEIGHT, ID, Video, WIDTH } from './Video'

export const RemotionRoot: React.FC = () => (
    <Composition id={ID} component={Video} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
)
