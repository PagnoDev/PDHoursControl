using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Application.Interfaces.IServices;
using PDHours.Domain.Models;

namespace PDHours.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportController(IReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReports(ODataQueryOptions<ReportModel> queryOptions)
        {
            try
            {
                IQueryable<ReportModel> reports = await _service.GetAll();
                IQueryable queriedReports = queryOptions.ApplyTo(reports);
                return Ok(queriedReports);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("LastByEmployee/{employeeId}")]
        public async Task<IActionResult> GetLastReportByEmployeeId(int employeeId)
        {
            LastReportByEmployeeDTO? lastReport = await _service.GetLastReportByEmployeeId(employeeId);

            if (lastReport == null)
            {
                return NotFound(new { message = $"Nenhum report encontrado para o employeeId {employeeId}." });
            }

            return Ok(lastReport);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDTO reportDTO)
        {
            try
            {
                _service.Create(reportDTO);
                return Created();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
