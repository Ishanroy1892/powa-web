define(['backbone',  'powa/models/DataSourceCollection', 'powa/models/MetricCollection',
        'backbone-pageable'
],
        function(Backbone, DataSourceCollection, MetricCollection){
    return Backbone.Model.extend({

        initialize: function(){
            var self = this;
            this.set("collection", new (Backbone.PageableCollection.extend({mode: "client"})));
            this.listenTo(this.get("common_group"), "metricgroup:dataload", this.update);
        },

        update: function(data){
            this.get("collection").reset(data);
            this.trigger("widget:needrefresh");
        }


    }, {
        fromJSON: function(jsonobj){
            var group = DataSourceCollection.get_instance(),
                metrics = jsonobj.metrics.map(function(metric){
                var splittedname = metric.split(".");
                var common_group = group.findWhere({name: splittedname[0]});
                if(common_group === undefined){
                    throw ("The metric group " + splittedname[0] + " could not be found. " +
                           " Did you forget to include it in the dashboardpage ? ");
                }
                var metric = common_group.get("metrics")
                        .findWhere({name: splittedname[1]});
                if(metric === undefined){
                    throw ( "The metric " + splittedname[1] + " could not be found in metric group " +
                            splittedname[0] );
                }
                jsonobj.common_group = common_group;
                return metric;
            });
            jsonobj.metrics = new MetricCollection(metrics);
            return new this(jsonobj);
        }
    });
});