# aeproject fire-editor

## [Fire Editor aepp](http://fireeditor.nikitafuchs.de/) integration

The integration between the aeproject and the [Fire Editor aepp](http://fireeditor.nikitafuchs.de/) allows the user to compile and deploy contracts, call contract's function from different accounts using the **Fire Editor aepp**. 

### Prerequisite

Please note that the *fire-editor* is running on top of Anular CLI 8.0+
The official Node.js version of *Anular CLI 8.0+* that is supported is **10.9.0** or greater

The Fire Editor aepp runs on [http://localhost:4200/](http://localhost:4200/) by default. There are two optional parameters to `aeproject fire-editor`:

* --update - update the Fire Editor aepp with the latest version;
* --ignoreOpenInBrowser - ignoring opening of the browser;