import { studentAPI, roomAPI } from './api';

class AllocationService {
  static async allocateStudents(examId, studentIds) {
    try {
      // Fetch all students
      const studentsRes = await studentAPI.getAll();
      const students = studentsRes.data.data.filter(s => studentIds.includes(s._id));
      
      // Fetch available rooms
      const roomsRes = await roomAPI.getAll({ isActive: true });
      const rooms = roomsRes.data.data;

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
        
        let seatCounter = 1;

        for (let row = 0; row < room.rows && seatsNeeded > 0; row++) {
          for (let col = 0; col < room.columns && seatsNeeded > 0; col++) {
            // Try to take one student from each department in round-robin
            const dept = departments[currentDeptIndex % departments.length];
            
            if (studentsByDept[dept] && studentsByDept[dept].length > 0) {
              const student = studentsByDept[dept].pop();
              
              // Generate seat number (e.g., A1, B2, etc.)
              const seatRow = String.fromCharCode(65 + row);
              const seatNumber = `${seatRow}${col + 1}`;
              
              roomAllocations.push({
                exam: examId,
                student: student._id,
                room: room._id,
                seatNumber: seatNumber,
                row: row,
                column: col,
                status: 'allocated'
              });
              
              seatsNeeded--;
            }
            
            currentDeptIndex++;
          }
        }

        allocations.push(...roomAllocations);
      }

      return allocations;
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

export default AllocationService;