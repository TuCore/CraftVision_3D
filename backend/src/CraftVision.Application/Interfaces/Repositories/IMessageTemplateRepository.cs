using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IMessageTemplateRepository
{
    Task<IEnumerable<MessageTemplate>> GetByCategoryIdAsync(Guid categoryId);
    Task<IEnumerable<MessageTemplate>> GetAllAsync();
    void Add(MessageTemplate template);
    void Update(MessageTemplate template);
    void Delete(MessageTemplate template);
}
