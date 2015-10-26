# Dynamic Media Fragment

This is a proposal for dynamic spatial media fragments, as well as
arbitrary shaped spatial media fragments, for highlighting moving
areas in videos. 

It adopts the principle of not reinventing the wheel, so since we are
talking about graphical shapes and trajectories, SVG is a natural
target.

The [live demo](http://olivieraubert.net/dynamic-media-fragments/)
exhibits different uses of the implementation.

## Shape syntax

The shape syntax is "simply" a [SVG &lt;path>
definition](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths),
which brings interesting features :

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
id. Given a video with the id `v1`, the defined shape will have the id
`v1_overlay_shape`. This allows to style the element through standard
CSS, by specifying fill and stroke colors, patterns, etc (see
[main.css]). If no video id is specified, it will be automatically
generated.

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

In order to facilitate debugging, you can add the ``debug=1``
developement parameter, which will then display the trajectory in
addition to the moving shape.

## Possible extensions

### Common shapes

If it is deemed desirable to have more common shapes available in SVG
such as circles and rectangles, the following extension is proposed
(and implemented): the shape element can optionnaly start with a shape
type specifier (one of `path`, `rect`, `circle`, `ellipse`) followed
by a colon and by a type-specific list of data points.

For path (which is the default if no shape type is specified), a [SVG
path](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
definition.

For rect, 4 numbers `x`, `y`, `width`, `height`

For circle, 3 numbers `cx` (center y), `cy` (center y) and `r` (radius)

For ellipse, 4 numbers `cx` (center y), `cy` (center y), `rx`
(horizontal radius) and `ry` (vertical radius)

## Shortcomings/evolutions

This proposal makes some simplifying assumptions, for which an
appropriate trade-off has to be found.

1. A mediafragment does not define more than one shape. If multiple
shapes must be defined, then multiple fragments should be used. Or you
can define multiple shapes in a single SVG path (see [demo page](http://olivieraubert.net/dynamic-media-fragments/#v7)).
Another idea could be to define the notion of MediaFragmentGroup, which
would group multiplefragments, so that we can address discontinuous
temporal or spatial ranges.

2. The shape itself does not change over its trajectory. This will not
work for instance in case of a face tracking algorithm that follows a
face in a shot, which could vary in scale and orientation. A possible
way to solve this would be to extend the trajectory path syntax by
adding a new "Scale" command, which would specify an object scale
change, e.g. `trajectory=M9,323C147,8 E0.5 C270,78 E1.0 C270,78`
(using `E` as command abbreviation, since `S` is already used). The
SVG standard defines an additional &lt;animateTransform> element for
this, but in XML syntax.

3. Similarly, the temporal specification is not flexible (it is a
linear interpolation of the trajectory of the fragment duration in the
current implementation). Temporal keypoints could be specified again
by extending the path syntax, e.g.  `t=0-10&trajectory=M9,323C147,8 K4
C270,78 K8 C270,78` (using `K` as `Keypoint` abbreviation, since SVG
defines the notion of Keypoints but with no associated compact syntax)
would specify durations associated to the current trajectory command.

4. Due to the flexibility of the SVG path definition, the
mediafragments will be more complex to interpret and query in
applications such as the [SPARQL-MM proposal](http://2014.eswc-conferences.org/sites/default/files/eswc2014pd_submission_65.pdf).

5. For complex SVG paths, that are too cumbersome to be put in a
single URL, a simple syntax extension could allow to reference
external SVG files, e.g. `shape=src:filename.svg` or
`shapesrc=filename.svg`. Note that this would make the dereferencing
more complex and less robust (since the referenced file could be
unavailable).

## Implementation details

The dynamic path support has been implemented using the SVG API method
`getPointAtLength`, using a linear interpolation between the temporal
position and the position on the trajectory path. This provides a
compact representation, but does not allow to specify specific keypoints.

I have made some tests with standard SVG animation features
(&lt;animate> and &lt;animateMotion>) but it proved impractical for 2 reasons :

- browser support is variable, even though
  [CanIUse](http://caniuse.com/#feat=svg-smil) states that there is
  good support

- video synchronisation should be achieved by SMIL timing events
  (begin/end), but I did not find any way to make it handle seeks
  inside the fragment (i.e. setting the position to something other
  than the begin).

If anyone has experience with combining SVG/SMIL animation events with
HTML5 video, feel free to comment.

## TODO

Some more ideas that could be ironed out, time permitting:

- provide an editor for both shapes and trajectories, using one of the
  many existing javascript SVG editors.

- using the shape as a clipping mask. It would involve defining it as
  a &lt;clipPath> or &lt;mask> element, and specifying the
  clip-path/mask CSS property for the video.  Silvia Pfeiffer's [HTML5
  Video
  guide](http://html5videoguide.net/DefinitiveGuide/chapter5.html) is
  a good starting point for this.

- find a way to specify timing information. SVG animation uses
  keypoints, but in XML syntax. We could extend the trajectory path
  definition with timing information, but we would then to split the
  path into multiple segments before interpolating them.
