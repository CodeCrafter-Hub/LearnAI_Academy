class ContentFilter {
  constructor() {
    // Inappropriate patterns to filter out
    this.inappropriatePatterns = [
      /\b(fuck|shit|damn|hell|bitch|ass|crap)\b/gi,
      /\b(sex|sexual|porn|xxx)\b/gi,
      /\b(kill|murder|suicide|harm)\b/gi,
      /\b(drug|cocaine|heroin|marijuana)\b/gi,
      /\b(hate|racist|bigot)\b/gi,
    ];

    // Prompt injection patterns to detect
    this.injectionPatterns = [
      /ignore (previous|above|all) instructions?/gi,
      /system:\s*/gi,
      /\[INST\]/gi,
      /<\|im_start\|>/gi,
      /you are now/gi,
      /new instructions?:/gi,
      /disregard (previous|above|all)/gi,
    ];
  }

  /**
   * Filter AI response content for safety
   */
  async filter(content, studentAge) {
    let filtered = content;
    let wasFiltered = false;

    // Check for inappropriate content
    for (const pattern of this.inappropriatePatterns) {
      if (pattern.test(filtered)) {
        console.warn('Inappropriate content detected and filtered');
        wasFiltered = true;
        filtered = "I apologize, but I can't provide that information. Let me help you with something else!";
        break;
      }
    }

    // Additional filtering for very young students
    if (studentAge < 10 && !wasFiltered) {
      // Be extra cautious with mature topics
      const matureTopics = /\b(death|violence|scary|blood)\b/gi;
      if (matureTopics.test(filtered)) {
        console.warn('Mature topic detected for young student');
        wasFiltered = true;
        filtered = this.makeAgeAppropriate(filtered, studentAge);
      }
    }

    return {
      content: filtered,
      wasFiltered,
    };
  }

  /**
   * Sanitize user input to prevent prompt injection
   */
  sanitizeInput(input) {
    let sanitized = input;

    // Remove potential prompt injection patterns
    for (const pattern of this.injectionPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Limit length to prevent token stuffing
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }

    return sanitized.trim();
  }

  /**
   * Make content more age-appropriate
   */
  makeAgeAppropriate(content, age) {
    // Replace scary/mature concepts with softer language
    if (age < 10) {
      content = content
        .replace(/\bdeath\b/gi, 'not being here anymore')
        .replace(/\bviolence\b/gi, 'not being kind')
        .replace(/\bscary\b/gi, 'a little spooky');
    }

    return content;
  }

  /**
   * Check if message looks like homework copying attempt
   */
  isHomeworkCheating(message) {
    const cheatingPatterns = [
      /give me the answer/gi,
      /what'?s the answer to/gi,
      /solve this for me/gi,
      /do my homework/gi,
      /complete this assignment/gi,
    ];

    return cheatingPatterns.some(pattern => pattern.test(message));
  }
}

export const contentFilter = new ContentFilter();
export default contentFilter;
