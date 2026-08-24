package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Address;
import com.sareesfornaaris.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    List<Address> findByUser(User user);
    int countByUser(User user);
}
