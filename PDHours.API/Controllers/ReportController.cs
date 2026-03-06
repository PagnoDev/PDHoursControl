using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Application.Interfaces.IServices;
using PDHours.Domain.Models;

namespace PDHours.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportController(IReportService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDTO reportDTO)
        {
            ReportModel newReport = new()
            {
                Description = reportDTO.Description,
                EmployeeId = reportDTO.EmployeeId,
                SpentHours = reportDTO.SpentHours
            };

            _service.Add(newReport);

            Console.WriteLine(newReport);

            return Created();
        }
    }
}
