# AudioBoost

A Web Extension that inserts a Web Audio API `GainNode` and `DynamicsCompressor`
node to increase the audio level of videos that are too quiet, while limiting
the maximum volume of those videos.

This is an enhanced version of https://github.com/padenot/up-to-eleven:
the input gain for the gain section, and the threshold and ratio for the compressor
are now controlled by sliders in a pop up window.

There is an enable/disable button in the pop up window
that allows you to turn the extension on and off.

