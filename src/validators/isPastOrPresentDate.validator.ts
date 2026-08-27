import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPastOrPresentDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPastOrPresentDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
          const now = new Date();
          return date <= now;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} cannot be a future date`;
        },
      },
    });
  };
}
