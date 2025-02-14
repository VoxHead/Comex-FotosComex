using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace FotosComex
{
    /// <summary>
    /// Descripción breve de Handler1
    /// </summary>
    public class Handler1 : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            if (context.Request.HttpMethod == "POST")
            {
                try
                {
                    // Verifica si hay archivos en la solicitud
                    if (context.Request.Files.Count == 0)
                    {
                        context.Response.StatusCode = 400;
                        context.Response.Write("Error: No se encontró ningún archivo en la solicitud.");
                        return;
                    }

                    HttpPostedFile uploadedFile = context.Request.Files[0]; // Obtener el archivo enviado

                    // Verificar si es una imagen válida
                    if (uploadedFile.ContentLength == 0)
                    {
                        context.Response.StatusCode = 400;
                        context.Response.Write("Error: Archivo vacío.");
                        return;
                    }

                    string fileName = $"captura_{DateTime.Now.Ticks}.png";
                    string directoryPath = context.Server.MapPath("~/Capturas/");
                    string filePath = Path.Combine(directoryPath, fileName);

                    // Crear la carpeta si no existe
                    if (!Directory.Exists(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    // Guardar la imagen en el servidor
                    uploadedFile.SaveAs(filePath);

                    context.Response.ContentType = "text/plain";
                    context.Response.Write("Imagen guardada correctamente: " + fileName);
                }
                catch (Exception ex)
                {
                    context.Response.StatusCode = 500;
                    context.Response.Write("Error al guardar la imagen: " + ex.Message);
                }
            }
            else
            {
                context.Response.StatusCode = 405;
                context.Response.Write("Método no permitido.");
            }
        }

        public bool IsReusable => false;
    }
}