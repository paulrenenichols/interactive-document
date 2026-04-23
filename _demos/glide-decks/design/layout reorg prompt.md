Put together a plan to help on this component and layout reorganization.

I've been dumping all the components to a shared rendering workspace for fast iteration on unifying styles.  I'd like to migrate to more production-style layouts.

Goals:

-Remove the left panel (won't be used in production view)
- add a three horizontal lines style menu button in the left corner of the header
- This should have options to control view
- To start add "Loose Components View" and "Authoring View" as options.  "Loose components view" is how the app looks now, without the left side bar.  "Authoring View" is as follows:

a) use the stitch screen `Data Model Context - Updated Nav` design to retrieve the segmented header "Data Model" <-> "Slide Deck" display.
b) When the user toggles "Slide Deck" show a large empty white square as a context placeholder for the slide deck authoring (A lightweight powerpoint clone which has not yet been designed) view
c) 