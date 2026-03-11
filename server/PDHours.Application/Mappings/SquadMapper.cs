using PDHours.Application.DTOs.SquadDTO;
using PDHours.Domain.Models;

namespace PDHours.Application.Mappings
{
    public static class SquadMapper
    {
        public static SquadModel ToModel(this CreateSquadDTO dto)
        {
            return new SquadModel
            {
                Name = dto.Name
            };
        }
    }
}
