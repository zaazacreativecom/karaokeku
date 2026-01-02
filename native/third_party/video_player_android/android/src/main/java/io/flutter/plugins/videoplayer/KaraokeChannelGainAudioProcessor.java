// Copyright 2013 The Flutter Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package io.flutter.plugins.videoplayer;

import androidx.media3.common.C;
import androidx.media3.common.audio.AudioProcessor;
import androidx.media3.common.audio.AudioProcessor.AudioFormat;
import androidx.media3.common.audio.BaseAudioProcessor;
import androidx.media3.common.util.UnstableApi;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

@UnstableApi
public final class KaraokeChannelGainAudioProcessor extends BaseAudioProcessor {
  private static final float STEREO_GAIN = 0.5f;
  private static final float LEFT_GAIN = 1.0f;
  private static final float RIGHT_MUTED_GAIN = 0.0f;

  private volatile float leftGain = LEFT_GAIN;
  private volatile float rightGain = RIGHT_MUTED_GAIN;

  public void setVocalOn(boolean vocalOn) {
    if (vocalOn) {
      leftGain = STEREO_GAIN;
      rightGain = STEREO_GAIN;
    } else {
      leftGain = LEFT_GAIN;
      rightGain = RIGHT_MUTED_GAIN;
    }
  }

  @Override
  protected AudioFormat onConfigure(AudioFormat inputAudioFormat)
      throws AudioProcessor.UnhandledAudioFormatException {
    if (inputAudioFormat.channelCount != 2) {
      return AudioFormat.NOT_SET;
    }
    if (inputAudioFormat.encoding != C.ENCODING_PCM_16BIT
        && inputAudioFormat.encoding != C.ENCODING_PCM_FLOAT) {
      return AudioFormat.NOT_SET;
    }
    return inputAudioFormat;
  }

  @Override
  public void queueInput(ByteBuffer inputBuffer) {
    if (!inputBuffer.hasRemaining()) {
      return;
    }

    inputBuffer.order(ByteOrder.nativeOrder());
    ByteBuffer outputBuffer = replaceOutputBuffer(inputBuffer.remaining());
    outputBuffer.order(ByteOrder.nativeOrder());

    if (inputAudioFormat.encoding == C.ENCODING_PCM_FLOAT) {
      while (inputBuffer.remaining() >= 8) {
        float left = inputBuffer.getFloat();
        float right = inputBuffer.getFloat();
        outputBuffer.putFloat(clampFloat(left * leftGain));
        outputBuffer.putFloat(clampFloat(right * rightGain));
      }
    } else {
      while (inputBuffer.remaining() >= 4) {
        short left = inputBuffer.getShort();
        short right = inputBuffer.getShort();
        outputBuffer.putShort(scaleShort(left, leftGain));
        outputBuffer.putShort(scaleShort(right, rightGain));
      }
    }

    outputBuffer.flip();
  }

  private static short scaleShort(short sample, float gain) {
    int scaled = Math.round(sample * gain);
    if (scaled > Short.MAX_VALUE) {
      return Short.MAX_VALUE;
    }
    if (scaled < Short.MIN_VALUE) {
      return Short.MIN_VALUE;
    }
    return (short) scaled;
  }

  private static float clampFloat(float value) {
    if (value > 1.0f) {
      return 1.0f;
    }
    if (value < -1.0f) {
      return -1.0f;
    }
    return value;
  }
}
