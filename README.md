# Dynamic Media Fragment

This is a proposal for dynamic spatial media fragments, as well as
arbitrary shaped spatial media fragments, for highlighting moving
areas in videos.

It adopts the principle of not reinventing the wheel, so talking about
graphical shapes and trajectories points at SVG.

The [live demo](http://olivieraubert.net/dynamic-media-fragments/)
exhibits different uses of the implementation.

## Shape syntax

The shape syntax is "simply" a SVG <path> definition. [TODO: link], which brings interesting features :
- it is standardized
- it is compact and expressive
- it make simple things relatively simple (freehand shapes), while allowing more complex things (bezier curves, etc)
- there is software/libraries (such as d3.js) for editing it and generating it
- there is software for reading it, and most especially web browsers
- it can be styled through standard CSS syntax

The path definition is passed as the `shape=` parameter. The
current implement considers a viewbox with the same dimensions as the
video widget, through this should be further specified and refined.

For example, the URL ```video.mp4#t=10,50&shape=M0 0l0 50 50 50 50 0z```
defines a 50pixel-wide square, in the top left corner of the video.

### Styling

The current implementation defines the shape id according to the video
id. Given a video with the id `v1`, the defined shape will have
the id `v1_overlay_shape`. This allows to style the element
through standard CSS, by specifying fill and stroke colors, patterns,
etc.

This could be defined through a CSS pseudo-element such as
`v1::overlay_shape`, though it actually is an element, so it
probably does not match the specification.

## Dynamic syntax

The dynamic syntax also uses SVG paths for its definition, and makes
the defined shape follow the given path during the duration of the
fragment. The current implementation uses the browser internal SVG
support for parsing and interpolating paths.

For example, the URL ```video.mp4#t=10,50&shape=M0 0l0 50 50 50 50 0z&trajectory=M0 0L200 200```
will move the aforementioned square in a diagonal line.
