package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.RefreshToken;
import com.sareesfornaaris.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    @Modifying
    int deleteByUser(User user);
}
