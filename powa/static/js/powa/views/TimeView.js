define(["powa/views/GraphView","powa/views/GraphPreview"], function(GraphView, GraphPreview){
    return GraphView.extend({

        update: function(newseries){
            GraphView.prototype.update.call(this, newseries);
            if(this.preview){
                var domain = this.graph.dataDomain();
                this.graph.window.xMin = domain[0];
                this.graph.window.xMax = domain[1];
                if(!this.preview.rendered){
                    this.preview.range = domain;
                }
                this.preview.render();
            }
            if(newseries.length > 0){
                this.graph.render();
            }
        },

        initGoodies: function(){
            GraphView.prototype.initGoodies.call(this);
            var self = this;
            var hoverDetail = new Rickshaw.Graph.HoverDetail( {
                graph: this.graph,
                formatter: function(series, x, y){
                    var type = series.metric.get("type") || "number";
                    var formatter = self.axisFormats[type];
                    var date = '<span class="date">' + new Date(x * 1000).toUTCString() + '</span>';
                    var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
                    var content = swatch + series.label + ": " + formatter(y) + '<br/>' + date;
                    return content;
                }
            });

            this.preview = new GraphPreview({
                graph: this.graph,
                element: this.$el.find(".graph_preview").get(0),
                range: this.graph.dataDomain()
            });
            this.preview.onSlide(function(graph, xmin, xmax){
                self.trigger("widget:zoomin", moment.unix(xmin), moment.unix(xmax));
            });
            this.dragzoom = new Rickshaw.Graph.DragZoom({
                    graph: this.graph,
                    callback: function(xmin, xmax){
                        self.trigger("widget:zoomin", moment.unix(xmin), moment.unix(xmax));
                    }
            });
        },

    });
});
