(function($) {
    'use strict';

    // Function used to create SVG elements. jquery does not handle the namespace issue correctly
    function $s(elem) {
        return $(document.createElementNS('http://www.w3.org/2000/svg', elem));
    }
    
    (function init() {
        $('video').each( function () {
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

        var shape = parameters.shape; // SVG path
        var trajectory = parameters.trajectory; // Subset of SVG path

        // Ensure that video element has an id
        var id = video.id || 'video_' + (Math.random()).toString().substr(2);
        video.id = id;

        $(video).wrap("<div class='overlay_container'></div>").each( function () {
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
            svg.append(g);
            var obj = $s("path")
                    .attr("id", video.id + "_overlay_shape")
                    .attr("class", "overlay_shape")
                    .attr("d", shape);
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
                if (debug)
                    svg.append($(object));
                var length = object.getTotalLength();
                update_position =  function (current_time, g) {
                    var percent = (current_time - start) / fragmentDuration;
                    var point = object.getPointAtLength( length * percent);
                    g.attr("transform", "translate(" + point.x + "," + point.y + ")");
                };
            }
            // Define listeners
            video.addEventListener('timeupdate', function() {
                update_position(video.currentTime, g);
            });
        });
    }
})(jQuery);
