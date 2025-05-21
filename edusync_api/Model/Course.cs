using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSyncAPI.Model
{
    public class Course
    {
        [Key]
        public Guid CourseId { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid InstructorId { get; set; }

        [Url]
        public string MediaUrl { get; set; } = string.Empty;

        [ForeignKey("InstructorId")]
        public virtual User Instructor { get; set; }
    }
}
