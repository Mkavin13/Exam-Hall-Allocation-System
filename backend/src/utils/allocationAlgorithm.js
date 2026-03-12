const Allocation = require('../models/Allocation');

class AllocationAlgorithm {
  static async allocateStudents(students, rooms, examId) {
    try {
      // Group students by department
      const studentsByDept = {};
      students.forEach(student => {
        if (!studentsByDept[student.department]) {
          studentsByDept[student.department] = [];
        }
        studentsByDept[student.department].push(student);
      });

      // Shuffle students within each department
      Object.keys(studentsByDept).forEach(dept => {
        studentsByDept[dept] = this.shuffleArray(studentsByDept[dept]);
      });

      // Sort rooms by capacity (largest first)
      const sortedRooms = rooms.sort((a, b) => b.capacity - a.capacity);
      
      const allocations = [];
      let currentDeptIndex = 0;
      const departments = Object.keys(studentsByDept);

      // For each room, allocate students
      for (const room of sortedRooms) {
        const roomAllocations = [];
        let seatsNeeded = Math.min(room.capacity, this.getTotalStudents(studentsByDept));
        
        // Create seat matrix for visualization
        const seatMatrix = Array(room.rows).fill().map(
          () => Array(room.columns).fill(null)
        );

        let seatCounter = 1;
        let row = 0, col = 0;

        while (seatsNeeded > 0 && this.getTotalStudents(studentsByDept) > 0) {
          // Try to take one student from each department in round-robin
          const dept = departments[currentDeptIndex % departments.length];
          
          if (studentsByDept[dept] && studentsByDept[dept].length > 0) {
            const student = studentsByDept[dept].pop();
            
            // Generate seat number (e.g., A1, B2, etc.)
            const seatRow = String.fromCharCode(65 + row);
            const seatNumber = `${seatRow}${col + 1}`;
            
            // Create allocation
            const allocation = {
              exam: examId,
              student: student._id,
              room: room._id,
              seatNumber: seatNumber,
              row: row,
              column: col
            };
            
            roomAllocations.push(allocation);
            
            // Update seat matrix
            seatMatrix[row][col] = {
              student: student,
              seatNumber: seatNumber
            };
            
            seatsNeeded--;
            
            // Move to next seat
            col++;
            if (col >= room.columns) {
              col = 0;
              row++;
            }
          }
          
          currentDeptIndex++;
        }

        // Save allocations for this room
        if (roomAllocations.length > 0) {
          allocations.push(...roomAllocations);
        }
      }

      // Bulk insert all allocations
      if (allocations.length > 0) {
        await Allocation.insertMany(allocations);
      }

      return {
        success: true,
        totalAllocated: allocations.length,
        allocations: allocations
      };

    } catch (error) {
      console.error('Allocation error:', error);
      throw error;
    }
  }

  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static getTotalStudents(studentsByDept) {
    return Object.values(studentsByDept).reduce(
      (total, dept) => total + dept.length, 0
    );
  }
}

module.exports = AllocationAlgorithm;