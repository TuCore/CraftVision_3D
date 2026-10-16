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
            foreach (var m in methods)
            {
                var paramsStr = string.Join(", ", m.GetParameters().Select(p => p.ParameterType.Name));
                Console.WriteLine($"{m.Name}({paramsStr})");
            }
        }
    }
}
