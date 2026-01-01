import { Request, Response } from "express";
import { EmployeeModel } from "@/models/Employee";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/types";

/**
 * Create a new employee
 */
export const createEmployee = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, position, nip, phone, address, is_active } =
      req.body as CreateEmployeeRequest;

    if (!name || !position) {
      throw new AppError("Employee name and position are required", 400);
    }

    // Check if NIP already exists
    if (nip) {
      const existingEmployee = await EmployeeModel.findByNip(nip);
      if (existingEmployee) {
        throw new AppError(`Employee with NIP ${nip} already exists`, 400);
      }
    }

    const employee = await EmployeeModel.create({
      name,
      position,
      nip,
      phone,
      address,
      is_active,
    });

    const response: ApiResponse<Employee> = {
      success: true,
      message: "Employee created successfully",
      data: employee,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all employees with pagination
 */
export const getAllEmployees = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive =
      req.query.is_active === "true"
        ? true
        : req.query.is_active === "false"
        ? false
        : undefined;
    const searchTerm = req.query.q as string | undefined;

    const result = await EmployeeModel.findAll(
      page,
      limit,
      isActive,
      searchTerm
    );

    const response: PaginatedResponse<Employee> = {
      data: result.employees,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Employees data retrieved successfully",
      data: response,
    });
  }
);

/**
 * Get employee by ID
 */
export const getEmployeeById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const employeeId = parseInt(req.params.id);

    if (isNaN(employeeId)) {
      throw new AppError("Invalid employee ID", 400);
    }

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const response: ApiResponse<Employee> = {
      success: true,
      message: "Employee data retrieved successfully",
      data: employee,
    };

    res.json(response);
  }
);

/**
 * Update employee by ID
 */
export const updateEmployeeById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const employeeId = parseInt(req.params.id);
    const updateData = req.body as UpdateEmployeeRequest;

    if (isNaN(employeeId)) {
      throw new AppError("Invalid employee ID", 400);
    }

    const existingEmployee = await EmployeeModel.findById(employeeId);
    if (!existingEmployee) {
      throw new AppError("Employee not found", 404);
    }

    // Check if NIP is being changed and if it's already taken
    if (updateData.nip && updateData.nip !== existingEmployee.nip) {
      const nipExists = await EmployeeModel.findByNip(updateData.nip);
      if (nipExists) {
        throw new AppError(
          `Employee with NIP ${updateData.nip} already exists`,
          400
        );
      }
    }

    const updatedEmployee = await EmployeeModel.update(employeeId, updateData);
    if (!updatedEmployee) {
      throw new AppError("Failed to update employee", 500);
    }

    const response: ApiResponse<Employee> = {
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    };

    res.json(response);
  }
);

/**
 * Delete employee by ID
 */
export const deleteEmployeeById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const employeeId = parseInt(req.params.id);

    if (isNaN(employeeId)) {
      throw new AppError("Invalid employee ID", 400);
    }

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const success = await EmployeeModel.delete(employeeId);
    if (!success) {
      throw new AppError("Failed to delete employee", 500);
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  }
);
