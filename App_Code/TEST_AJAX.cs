using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Services;


/// <summary>
/// Summary description for TEST_AJAX
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
 [System.Web.Script.Services.ScriptService]
public class TEST_AJAX : System.Web.Services.WebService {

    public TEST_AJAX () {

        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    [WebMethod]
    public static string HelloWorld() {
        return "Hello World";
    }
    
}
