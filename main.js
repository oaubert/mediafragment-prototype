(function($) {
    'use strict';

    // Function used to create SVG elements. jquery does not handle the namespace issue correctly
    function $s(elem) {
        return $(document.createElementNS('http://www.w3.org/2000/svg', elem));
    }

    (function init() {
        $('video').each(function () {
            if (this.readyState !== 4) {
                this.addEventListener('loadedmetadata', function() {
                    return parseVideoSource(this);
                });
            } else {
                return parseVideoSource(this);
            }
        });
    })();

    function parseVideoSource(video) {
        var source = video.currentSrc;
        var hash = source.substring(source.indexOf('#') + 1).split('&');
        var parameters = {};
        hash.map(function(keyValue) {
            var key = keyValue.split('=')[0];
            var value = keyValue.split('=')[1];
            parameters[key] = value;
        });

        var start = parameters.t.split(',')[0];
        var end = parameters.t.split(',')[1];
        var debug = parameters.debug;
        var fragmentDuration = end - start;

        var shape = decodeURIComponent(parameters.shape || ""); // SVG path
        var trajectory = decodeURIComponent(parameters.trajectory || ""); // Subset of SVG path

        // Ensure that video element has an id
        var id = video.id || 'video_' + (Math.random()).toString().substr(2);
        video.id = id;

        $(video).wrap("<div class='overlay_container'></div>").each(function () {
            var container = $(this).parent().css("position", "relative");
            $(this).css({
                position: "absolute",
                top: "0px",
                left: "0px"
            });

            var width = $(this).width();
            var height = $(this).height();
            var svg = $s("svg")
                    .attr({
                        class: "svg_overlay",
                        version:"1.1",
                        xmlns: "http://www.w3.org/2000/svg",
                        "xmlns:xlink": "http://www.w3.org/1999/xlink",
                        x: "0px",
                        y: "0px",
                        viewBox: "0 0 " + width + " " + height,
                        "enable-background": "new 0 0 " + width + " " + height,
                        "xml:space": "preserve",
                        width: width,
                        height: height,
                        id: video.id + "_overlay" })
                    .css({
                        position: "absolute",
                        top: "0px",
                        left: "0px"
                    });
            container.append(svg);

            var g = $s("g")
                    .attr("id", video.id + "_overlay_group");

            if (parameters.mode == 'mask') {
                var defs = $s("defs");
                svg.append(defs);
                var mask = $s("mask")
                        .attr("id", video.id + "_overlay_mask")
                        .attr("maskUnits", "userSpaceOnUse")
                        .attr("maskContentUnits", "userSpaceOnUse");
                defs.append(mask);
                mask.append(g);
            } else {
                svg.append(g);
            }

            var _data = /^(circle|rect|ellipse|path):(.+)/.exec(shape);
            if (!_data) {
                // If no shape type is specified, consider it is a path
                _data = [ shape, 'path', shape ];
            }
            var obj;
            var points;
            switch (_data[1]) {
            case 'path':
                obj = $s("path")
                    .attr("d", _data[2]);
                break;
            case 'rect':
                points = _data[2].split(" ");
                obj = $s("rect")
                    .attr("x", points[0])
                    .attr("y", points[1])
                    .attr("width", points[2])
                    .attr("height", points[3]);
                break;
            case 'circle':
                points = _data[2].split(" ");
                obj = $s("circle")
                    .attr("cx", points[0])
                    .attr("cy", points[1])
                    .attr("r", points[2]);
                break;
            case 'ellipse':
                points = _data[2].split(" ");
                obj = $s("ellipse")
                    .attr("cx", points[0])
                    .attr("cy", points[1])
                    .attr("rx", points[2])
                    .attr("ry", points[3]);
                break;
            };
            // Define common attributes
            obj.attr("id", video.id + "_overlay_shape")
                .attr("class", "overlay_shape");
            g.append(obj);

            var update_position = function(current_time, g) {
                return;
            };

            // Create a trajectory path
            if (trajectory) {
                // Inspired by https://github.com/yairEO/pathAnimator
                var object = $s('path')
                        .attr('d', trajectory)
                        .attr('fill', 'none')
                        .attr('stroke', 'red')[0];
                if (debug) {
                    svg.append($(object));
                }
                var length = object.getTotalLength();
                update_position =  function (current_time, g) {
                    var percent = (current_time - start) / fragmentDuration;
                    var point = object.getPointAtLength(length * percent);
                    g.attr("transform", "translate(" + point.x + "," + point.y + ")");
                };
            }
            var HIDDEN = 0, SHOWN = 1;
            var state = SHOWN;
            function hide_shape() {
                if (state !== HIDDEN) {
                    svg.hide();
                    state = HIDDEN;
                }
            }
            function show_shape() {
                if (state != SHOWN) {
                    svg.show();
                    state = SHOWN;
                }
            }
            // If a trajectory is defined, its starting point may not
            // be the initialization point, so start by hiding the
            // shape
            if (trajectory) {
                hide_shape();
            }
            video.addEventListener('timeupdate', function() {
                if (video.currentTime < start || video.currentTime > end) {
                    hide_shape();
                } else {
                    if (trajectory) {
                        update_position(video.currentTime, g);
                    }
                    if (state !== SHOWN) {
                        show_shape();
                    }
                }
            });
        });
    }
})(jQuery);
