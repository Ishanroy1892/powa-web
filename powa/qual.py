from powa.dashboards import (
    Dashboard, Graph, Grid,
    MetricGroupDef, MetricDef,
    DashboardPage,
    ContentWidget)
from sqlalchemy.sql import text
from powa.sql import aggregate_qual_values, resolve_quals
from powa.query import QueryOverview


class QualConstantsMetricGroup(MetricGroupDef):
    """
    Metric group used for the qual charts.
    """
    data_url = r"/metrics/database/(\w+)/query/(\w+)/qual/(\w+)/constants"
    query = aggregate_qual_values(text("""
        s.dbname = :database AND
        s.md5query = :query AND
        qn.nodehash = :nodehash AND
        coalesce_range && tstzrange(:from, :to)"""))


class QualDetail(ContentWidget):
    """
    Content widget showing detail for a specific qual.
    """

    data_url = r"/database/(\w+)/query/(\w+)/qual/(\w+)/detail"

    QUAL_DEF_QUERY = text("""
        SELECT nodehash, queryid, to_json(quals) as quals, filter_ratio, count,
               md5query = :query as is_my_query, query, md5query
        FROM powa_statements INNER JOIN powa_qualstats_statements USING (md5query),
        LATERAL powa_qualstats_getstatdata_sample(tstzrange(:from, :to), queryid, 1)
        WHERE nodehash = :nodehash
    """)

    def get(self, database, query, qual):
        quals = list(self.execute(
            self.QUAL_DEF_QUERY,
            params={"query": query,
                    "from": self.get_argument("from"),
                    "to": self.get_argument("to"),
                    "nodehash": qual}))
        quals = resolve_quals(self.connect(database=database), quals)
        my_qual = None
        other_queries = {}
        for qual in quals:
            if qual['is_my_query']:
                my_qual = qual
            else:
                other_queries[qual['md5query']] = qual['query']
        self.render("database/query/qualdetail.html",
                    qual=my_qual,
                    database=database,
                    other_queries=other_queries)


class QualOverview(DashboardPage):
    """
    Dashboard page for a specific qual.
    """

    base_url = r"/database/(\w+)/query/(\w+)/qual/(\w+)"

    params = ["database", "query", "qual"]

    parent = QueryOverview

    datasources = [QualDetail]

    dashboard = Dashboard(
        "Qual %(qual)s",
        [[QualDetail("Detail for this Qual")]])





