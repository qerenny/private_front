import { BaseService } from "../common/baseService";
import { User } from "../entities/User";
import { hashPassword } from "../utils/hashPassword";

export class UserService extends BaseService<User> {
  private static readonly DEFAULT_ROLE_ID = 2;

  constructor() {
    super(User);
  }

  async findAllWithRelations() {
    return this.repository.find({ relations: ["role"] });
  }

  async findOneWithRelations(id: number) {
    return this.repository.findOne({ where: { id }, relations: ["role"] });
  }

  async findByEmail(email: string) {
    return this.repository.findOne({ where: { email }, relations: ["role"] });
  }

  override async create(data: Partial<User>) {
    const role_id = data.role_id ?? UserService.DEFAULT_ROLE_ID;

    const user = this.repository.create({
      ...data,
      role_id,
      password_hash: hashPassword(data.password_hash || ""),
    });
    return this.repository.save(user);
  }
}
