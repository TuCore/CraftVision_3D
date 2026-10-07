using System;
using System.Reflection;
using System.Linq;
using PayOS;

class Program
{
    static void Main()
    {
        var type = typeof(PayOSClient).GetProperty("PaymentRequests")?.PropertyType;
        if (type != null)
        {
            var methods = type.GetMethods();
            foreach (var method in methods.Where(m => m.Name == "GetAsync"))
            {
                var p = method.GetParameters().FirstOrDefault();
                Console.WriteLine("GetAsync parameter: " + p?.ParameterType.Name);
            }
        }
    }
}
