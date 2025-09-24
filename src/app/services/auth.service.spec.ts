import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensure no unmatched requests
    sessionStorage.clear();
  });

  it('should register a new user', (done) => {
    const mockUsers = [
      { id: 1, username: 'user1', password: 'pass1' },
      { id: 2, username: 'user2', password: 'pass2' }
    ];

    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      password: '123456',
      address: '123 Street'
    };

    const expectedId = mockUsers.length + 1;

    // Call the register function
    service.register(
      newUser.firstName,
      newUser.lastName,
      newUser.username,
      newUser.password,
      newUser.address
    ).subscribe(res => {
      expect(res).toBeTruthy();
      expect(res.id).toBe(expectedId);
      expect(res.username).toBe(newUser.username);
      done();
    });

    // Mock GET request to fetch current users
    const reqGet = httpMock.expectOne('assets/mock-users.json');
    expect(reqGet.request.method).toBe('GET');
    reqGet.flush(mockUsers);

    // Mock POST request to register new user
    const reqPost = httpMock.expectOne('assets/mock-users.json');
    expect(reqPost.request.method).toBe('POST');
    expect(reqPost.request.body).toEqual({
      id: expectedId,
      name: newUser.firstName + newUser.lastName,
      username: newUser.username,
      password: newUser.password,
      address: newUser.address
    });

    // Respond to POST
    reqPost.flush({
      id: expectedId,
      name: newUser.firstName + newUser.lastName,
      username: newUser.username,
      password: newUser.password,
      address: newUser.address
    });
  });
});
