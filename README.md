# AudioBoost
Screenshot:
<img src="https://user-images.githubusercontent.com/37170027/232359909-968baf60-5cec-4ec1-b14e-9f5a03bbae90.png" height="200" alt="Example Image">

A Web Extension that inserts a Web Audio API `GainNode` and `DynamicsCompressor`
node to increase the audio level of videos that are too quiet, while limiting
the maximum volume of those videos.

This is an enhanced version of https://github.com/padenot/up-to-eleven:
the input gain for the gain section, and the threshold and ratio for the compressor
are now controlled by sliders in a pop up window.

There is an enable/disable button in the pop up window
that allows you to turn the extension on and off.

If you would like to run this plugin, clone the contents to a directory on your machine.

To install an extension temporarily:

    open Firefox
    enter "about:debugging" in the URL bar
    click "This Firefox"
    click "Load Temporary Add-on"
    open the extension's directory and select any file inside the extension,
    or select the packaged extension (.zip file).

The extension installs and remains installed until you remove it or restart Firefox.

I am working on submitting this plugin to the Mozilla Extension Library so hopefully I
will add a link soon to add the plugin without this temp workaround.
