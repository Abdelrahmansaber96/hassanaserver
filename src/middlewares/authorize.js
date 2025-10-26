// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Check if user can access specific resource
const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      const resourceId = req.params.id;

      // Admin has access to everything
      if (user.role === 'admin') {
        return next();
      }

      // Role-specific access logic
      switch (resourceType) {
        case 'booking':
          // Staff and doctors can access bookings from their branch
          if (user.role === 'staff' || user.role === 'doctor') {
            const Booking = require('../models/Booking');
            const booking = await Booking.findById(resourceId).populate('branch');
            
            if (!booking) {
              return res.status(404).json({
                success: false,
                message: 'Booking not found'
              });
            }

            if (user.branch && booking.branch._id.toString() !== user.branch.toString()) {
              return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access bookings from your branch.'
              });
            }
          }
          break;

        case 'consultation':
          // Doctors can only access their own consultations
          if (user.role === 'doctor') {
            const Consultation = require('../models/Consultation');
            const consultation = await Consultation.findById(resourceId);
            
            if (!consultation) {
              return res.status(404).json({
                success: false,
                message: 'Consultation not found'
              });
            }

            if (consultation.doctor.toString() !== user._id.toString()) {
              return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own consultations.'
              });
            }
          }
          break;

        case 'customer':
          // Staff can only access customers from their branch bookings
          if (user.role === 'staff') {
            const Customer = require('../models/Customer');
            const Booking = require('../models/Booking');
            
            const customerBookings = await Booking.find({
              customer: resourceId,
              branch: user.branch
            });

            if (customerBookings.length === 0) {
              return res.status(403).json({
                success: false,
                message: 'Access denied. Customer has no bookings in your branch.'
              });
            }
          }
          break;

        case 'branch':
          // Staff and doctors can only access their own branch
          if ((user.role === 'staff' || user.role === 'doctor') && 
              user.branch && user.branch.toString() !== resourceId) {
            return res.status(403).json({
              success: false,
              message: 'Access denied. You can only access your own branch.'
            });
          }
          break;

        case 'user':
          // Users can only access their own profile unless admin
          if (user._id.toString() !== resourceId) {
            return res.status(403).json({
              success: false,
              message: 'Access denied. You can only access your own profile.'
            });
          }
          break;

        default:
          break;
      }

      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in access control'
      });
    }
  };
};

// Check if user can perform specific action
const checkActionPermission = (action, resourceType) => {
  return (req, res, next) => {
    const { user } = req;

    // Define permission matrix
    const permissions = {
      admin: {
        all: ['create', 'read', 'update', 'delete', 'manage']
      },
      staff: {
        customer: ['create', 'read', 'update'],
        booking: ['create', 'read', 'update'],
        consultation: ['read'],
        offer: ['read'],
        notification: ['read'],
        branch: ['read'],
        doctor: ['read']
      },
      doctor: {
        customer: ['read'],
        booking: ['create', 'read', 'update', 'delete'],
        consultation: ['create', 'read', 'update'],
        offer: ['read'],
        notification: ['read'],
        branch: ['read'],
        doctor: ['read'] // الأطباء يمكنهم قراءة معلومات الأطباء
      }
    };

    // Check if user has permission
    const userPermissions = permissions[user.role];
    
    if (userPermissions?.all?.includes(action) || 
        userPermissions?.[resourceType]?.includes(action)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You don't have permission to ${action} ${resourceType}.`
    });
  };
};

module.exports = {
  authorize,
  checkResourceAccess,
  checkActionPermission
};