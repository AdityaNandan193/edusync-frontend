using EduSyncAPI.Data;
using EduSyncAPI.Dto;
using EduSyncAPI.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EduSyncAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly EduSyncDbContext _context;

        public CourseController(EduSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/Course
        // Returns all courses with their instructor's name
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseWithInstructorDto>>> GetCourses()
        {
            var coursesWithInstructors = await _context.Courses
                .Include(c => c.Instructor) // Ensure navigation property Instructor exists in Course model
                .Select(c => new CourseWithInstructorDto
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    MediaUrl = c.MediaUrl,
                    InstructorId = c.InstructorId,
                    InstructorName = c.Instructor != null ? c.Instructor.Name : string.Empty
                })
                .ToListAsync();

            return Ok(coursesWithInstructors);
        }

        // GET: api/Course/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseWithInstructorDto>> GetCourse(Guid id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .Where(c => c.CourseId == id)
                .Select(c => new CourseWithInstructorDto
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    MediaUrl = c.MediaUrl,
                    InstructorId = c.InstructorId,
                    InstructorName = c.Instructor != null ? c.Instructor.Name : string.Empty
                })
                .FirstOrDefaultAsync();

            if (course == null)
                return NotFound();

            return Ok(course);
        }

        // POST: api/Course
        [HttpPost]
        public async Task<IActionResult> PostCourse([FromBody] CourseCreateDto courseDto)
        {
            var instructor = await _context.Users.FirstOrDefaultAsync(u => u.UserId == courseDto.InstructorId && u.Role == "Instructor");
            if (instructor == null)
                return BadRequest("Instructor not found.");

            var course = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = courseDto.Title,
                Description = courseDto.Description,
                InstructorId = courseDto.InstructorId,
                MediaUrl = courseDto.MediaUrl
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
        }

        // PUT: api/Course/{id}
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutCourse(Guid id, Course course)
        //{
        //    if (id != course.CourseId)
        //        return BadRequest("Course ID mismatch.");

        //    _context.Entry(course).State = EntityState.Modified;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!CourseExists(id))
        //            return NotFound();
        //        else
        //            throw;
        //    }

        //    return NoContent();
        //}


        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourse(Guid id, CourseUpdateDto courseDto)
        {
            var existingCourse = await _context.Courses.FindAsync(id);
            if (existingCourse == null)
                return NotFound();

            // Only update the basic course information
            existingCourse.Title = courseDto.Title;
            existingCourse.Description = courseDto.Description;
            existingCourse.MediaUrl = courseDto.MediaUrl;
            // Keep the existing InstructorId

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Course/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
