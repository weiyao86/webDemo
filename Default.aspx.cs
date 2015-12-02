using System;
using System.Collections.Generic;

using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Web.Services;
public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            getParams();
            Bind();
            ColumnsMerger();
        }
    }
    public string getPage(object o)
    {
        string d = o.ToString();
        if (d == "12")
            return "我们的歌,只为你存在";
        return d;
    }
    public string getParams()
    {
        string str = Request.QueryString["str"];
        //string test  = HttpUtility.UrlDecode(str);
        return str;
    }
    public void Bind()
    {


        DataTable dt = new DataTable();
        dt.Columns.Add("aa", typeof(string));
        dt.Columns.Add("bb", typeof(string));

        DataRow r = dt.NewRow();
        r["aa"] = "aaaa";
        r["bb"] = "bbbb";
        dt.Rows.Add(r);
        DataRow r1 = dt.NewRow();
        r1["aa"] = "aaaa";
        r1["bb"] = "bbbb";
        dt.Rows.Add(r1);
        DataRow r2 = dt.NewRow();
        r2["aa"] = "aaaa";
        r2["bb"] = "bbbb";
        dt.Rows.Add(r2);
        DataRow r3 = dt.NewRow();
        r3["aa"] = "ccc";
        r3["bb"] = "bbbb";
        dt.Rows.Add(r3);
        DataRow r4 = dt.NewRow();
        r4["aa"] = "ccc";
        r4["bb"] = "bbbb";
        dt.Rows.Add(r4);
        gvshow.DataSource = dt;
        gvshow.DataBind();

    }
    public void ColumnsMerger()
    {
        int i = 0;
        int rowSpan = 1;
        while (i < gvshow.Rows.Count - 1)
        {
            GridViewRow gvRow = gvshow.Rows[i];
            for (++i; i < gvshow.Rows.Count; i++)
            {
                GridViewRow gvNext = gvshow.Rows[i];
                if (((Label)gvRow.Cells[0].FindControl("lb")).Text == ((Label)gvNext.Cells[0].FindControl("lb")).Text)
                {
                    gvNext.Cells[0].Visible = false;
                    rowSpan++;
                }
                else
                {
                    gvRow.Cells[0].RowSpan = rowSpan;
                    rowSpan = 1;
                    break;
                }
                if (i == gvshow.Rows.Count - 1)
                {
                    gvRow.Cells[0].RowSpan = rowSpan;
                }
            }
        }
    }
    [WebMethod]
    public static string helloworld()
    {
        return "helloworld";
    }
}