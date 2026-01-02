// Copyright 2013 The Flutter Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package io.flutter.plugins.videoplayer;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.media3.common.audio.AudioProcessor;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.exoplayer.DefaultRenderersFactory;
import androidx.media3.exoplayer.audio.AudioSink;
import androidx.media3.exoplayer.audio.DefaultAudioSink;

@UnstableApi
public final class KaraokeRenderersFactory extends DefaultRenderersFactory {
  private final KaraokeChannelGainAudioProcessor karaokeChannelGainAudioProcessor;

  public KaraokeRenderersFactory(
      @NonNull Context context,
      @NonNull KaraokeChannelGainAudioProcessor karaokeChannelGainAudioProcessor) {
    super(context);
    this.karaokeChannelGainAudioProcessor = karaokeChannelGainAudioProcessor;
  }

  @Override
  protected AudioSink buildAudioSink(
      Context context, boolean enableFloatOutput, boolean enableAudioTrackPlaybackParams) {
    return new DefaultAudioSink.Builder(context)
        .setEnableFloatOutput(enableFloatOutput)
        .setEnableAudioTrackPlaybackParams(enableAudioTrackPlaybackParams)
        .setAudioProcessors(new AudioProcessor[] {karaokeChannelGainAudioProcessor})
        .build();
  }
}
