using System;
using System.Collections.Generic;

using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class E : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            Load();
        }
    }
    public void Load()
    {
        string query = Request.QueryString["code"];
        string test = "test试";
        int ln = test.Length;
        test = "测试测试试";
        ln = test.Length;
    
    
    }
    protected void btnTest_Click(object sender, EventArgs e)
    {

        Response.Redirect("移动轨迹.html");
    }
}